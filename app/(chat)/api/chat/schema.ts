import { z } from "zod";

const textPartSchema = z.object({
  type: z.enum(["text"]),
  text: z.string().min(1).max(10000),
});

const filePartSchema = z.object({
  type: z.enum(["file"]),
  mediaType: z.enum(["image/jpeg", "image/png", "image/gif", "image/webp"]),
  name: z.string().min(1).max(100),
  url: z.string(),
});

const partSchema = z.union([textPartSchema, filePartSchema]);

const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(partSchema),
});

export const postRequestBodySchema = z.object({
  id: z.string().uuid(),
  message: z.object({
    id: z.string(),
    role: z.enum(["user"]),
    parts: z.array(partSchema),
  }),
  messages: z.array(messageSchema).optional(),
  selectedChatModel: z.string(),
});

export type PostRequestBody = z.infer<typeof postRequestBodySchema>;
