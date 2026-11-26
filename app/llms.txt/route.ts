import { llmsIndex, textResponse } from "@/lib/llms";

export const GET = () => textResponse(llmsIndex());
