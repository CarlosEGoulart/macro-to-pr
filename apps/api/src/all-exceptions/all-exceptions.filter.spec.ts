import { AllExceptionsFilter } from './all-exceptions.filter.js';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';

describe('AllExceptionsFilter', () => {
  it('should be defined', () => {
    expect(new AllExceptionsFilter()).toBeDefined();
  });

  it('should return 409 for Prisma P2002 unique constraint violation', () => {
    const filter = new AllExceptionsFilter();

    const exception = new Error('Unique constraint failed');
    (exception as any).code = 'P2002';

    const host = {
      switchToHttp: () => ({
        getResponse: () => ({
          status: (code: number) => {
            expect(code).toBe(HttpStatus.CONFLICT);
            return { json: () => {} };
          },
        }),
        getRequest: () => ({
          method: 'POST',
          url: '/test',
        }),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(exception, host);
  });

  it('should return 404 for Prisma P2025 record not found', () => {
    const filter = new AllExceptionsFilter();

    const exception = new Error('Record not found');
    (exception as any).code = 'P2025';

    const host = {
      switchToHttp: () => ({
        getResponse: () => ({
          status: (code: number) => {
            expect(code).toBe(HttpStatus.NOT_FOUND);
            return { json: () => {} };
          },
        }),
        getRequest: () => ({
          method: 'GET',
          url: '/test/1',
        }),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(exception, host);
  });
});
