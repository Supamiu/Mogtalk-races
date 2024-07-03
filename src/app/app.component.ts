import {afterNextRender, Component, inject} from '@angular/core';
import {AuthService} from "./auth/auth.service";
import {filter, map, switchMap} from "rxjs";
import {UsersService} from "./database/users.service";
import {ClearReportsService} from "./database/clear-reports.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  auth = inject(AuthService);
  #usersService = inject(UsersService);
  #reportsService = inject(ClearReportsService);
  isOverlay = false;

  character$ = this.auth.user$.pipe(
    filter(Boolean),
    switchMap(user => this.#usersService.getCharacter(user.lodestoneId))
  );

  reportsCount$ = this.auth.userIsTracker$.pipe(
    filter(Boolean),
    switchMap(() => this.#reportsService.pending$),
    map(reports => reports.length)
  )

  constructor() {
    afterNextRender(() => {
      this.isOverlay = window.location.href.includes('-overlay');
    });
  }

  signOut(): void {
    this.auth.signOut();
  }
}
