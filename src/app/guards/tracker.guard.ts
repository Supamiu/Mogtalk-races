import {CanActivateFn} from '@angular/router';
import {inject} from "@angular/core";
import {AuthService} from "../auth/auth.service";

export const trackerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.userIsTracker$;
};
