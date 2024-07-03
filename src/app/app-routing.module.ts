import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {trackerGuard} from "./guards/tracker.guard";

const routes: Routes = [
  {
    path: 'races',
    loadComponent: () => import('./races/races.component').then(c => c.RacesComponent)
  },
  {
    path: 'teams',
    loadComponent: () => import('./teams/teams.component').then(c => c.TeamsComponent),
    canActivate: [trackerGuard]
  },
  {
    path: 'reports',
    loadComponent: () => import('./reports/reports.component').then(c => c.ReportsComponent),
    canActivate: [trackerGuard]
  },
  {
    path: 'history',
    loadComponent: () => import('./history/history.component').then(c => c.HistoryComponent),
    canActivate: [trackerGuard]
  },
  {
    path: 'leaderboard-overlay',
    loadComponent: () => import('./leaderboard/overlay/overlay.component').then(c => c.OverlayComponent)
  },
  {
    path: 'race/:id/:name',
    loadComponent: () => import('./race/race.component').then(c => c.RaceComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login-popup/login-popup.component').then(c => c.LoginPopupComponent)
  },
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(c => c.HomeComponent)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
