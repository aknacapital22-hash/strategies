import { llmsFull, textResponse } from "@/lib/llms";

export const GET = () => textResponse(llmsFull());
