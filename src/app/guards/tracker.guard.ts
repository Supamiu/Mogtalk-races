import {CanActivateFn} from '@angular/router';
import {inject} from "@angular/core";
import {AuthService} from "../auth/auth.service";
import {tap} from "rxjs";

export const trackerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.userIsTracker$.pipe(tap(console.log));
};
