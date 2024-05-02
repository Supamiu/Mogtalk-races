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
  },
  {
    path: 'reports',
    loadComponent: () => import('./reports/reports.component').then(c => c.ReportsComponent),
  },
  {
    path: 'race/:id/:name',
    loadComponent: () => import('./race/race.component').then(c => c.RaceComponent)
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
