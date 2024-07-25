import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RawHeader = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.rawHeaders;
  },
);
