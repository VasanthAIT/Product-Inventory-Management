import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Role } from '../enums/role.enum';
import { RolesGuard } from './roles.guard';

const createContext = (role?: Role) =>
  ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest
        .fn()
        .mockReturnValue({ user: role ? { role } : undefined }),
    }),
  }) as unknown as ExecutionContext;

describe('RolesGuard', () => {
  it('allows when route has no roles metadata', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('allows users with a matching role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([Role.Admin]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createContext(Role.Admin))).toBe(true);
  });

  it('blocks users without the required role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([Role.Admin]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createContext(Role.User))).toBe(false);
  });
});
