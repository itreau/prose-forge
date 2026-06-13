import { Data, Effect, Stream } from "effect";
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
  HttpBody,
} from "@effect/platform";
import { loadAIConfig, type AIConfig, type ChatMessage } from "./types";

export class AIError extends Data.TaggedError("AIError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export interface ChatClient {
  complete(
    messages: ChatMessage[],
  ): Effect.Effect<string, AIError, HttpClient.HttpClient>;
  stream(
    messages: ChatMessage[],
  ): Stream.Stream<string, AIError, HttpClient.HttpClient>;
}

function buildHeaders(config: AIConfig): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (config.apiKey) {
    headers["Authorization"] = `Bearer ${config.apiKey}`;
  }
  return headers;
}

function requireOkStatus(
  response: HttpClientResponse.HttpClientResponse,
): Effect.Effect<HttpClientResponse.HttpClientResponse, AIError> {
  if (response.status >= 400) {
    return Effect.fail(new AIError({ message: `HTTP ${response.status}` }));
  }
  return Effect.succeed(response);
}

function parseSSEBuffer(buffer: string): [string, string[]] {
  const events: string[] = [];
  const parts = buffer.split("\n\n");
  const remaining = parts.pop()!;

  for (const part of parts) {
    for (const line of part.split("\n")) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6);
      if (data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data);
        const content: string | undefined = parsed.choices?.[0]?.delta?.content;
        if (content) events.push(content);
      } catch {
        // skip malformed chunks
      }
    }
  }

  return [remaining, events];
}

export function createChatClient(config: AIConfig): ChatClient {
  const complete = (
    messages: ChatMessage[],
  ): Effect.Effect<string, AIError, HttpClient.HttpClient> =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;
      const request = HttpClientRequest.post(config.apiUrl.replace(/\/$/, ""), {
        headers: buildHeaders(config),
        body: HttpBody.unsafeJson({
          model: config.modelName,
          messages,
          stream: false,
        }),
      });

      const response = yield* client.execute(request).pipe(
        Effect.mapError(
          (e) => new AIError({ message: "Request failed", cause: e }),
        ),
      );

      yield* requireOkStatus(response);

      const body = yield* response.json.pipe(
        Effect.mapError(
          (e) => new AIError({ message: "Failed to parse response", cause: e }),
        ),
      );

      const result = body as {
        choices: Array<{ message: { content: string } }>;
      };
      return result.choices?.[0]?.message?.content ?? "";
    });

  const stream = (
    messages: ChatMessage[],
  ): Stream.Stream<string, AIError, HttpClient.HttpClient> =>
    Stream.unwrap(
      Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;
        const request = HttpClientRequest.post(config.apiUrl.replace(/\/$/, ""), {
          headers: {
            ...buildHeaders(config),
            Accept: "text/event-stream",
          },
          body: HttpBody.unsafeJson({
            model: config.modelName,
            messages,
            stream: true,
          }),
        });

        const response = yield* client.execute(request).pipe(
          Effect.mapError(
            (e) => new AIError({ message: "Request failed", cause: e }),
          ),
        );

        yield* requireOkStatus(response);

        const byteStream = HttpClientResponse.stream(
          Effect.succeed(response),
        );
        const decoder = new TextDecoder();

        return byteStream.pipe(
          Stream.mapError(
            (e) => new AIError({ message: "Stream error", cause: e }),
          ),
          Stream.mapAccum("", (buffer, chunk) => {
            const combined =
              buffer + decoder.decode(chunk as Uint8Array, { stream: true });
            const [remaining, events] = parseSSEBuffer(combined);
            return [remaining, events] as const;
          }),
          Stream.flatMap((events) => Stream.fromIterable(events)),
        );
      }),
    );

  return { complete, stream };
}

export { FetchHttpClient };

export function getChatClient(): ChatClient {
  return createChatClient(loadAIConfig());
}