import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {
    path: 'races',
    loadComponent: () => import('./races/races.component').then(c => c.RacesComponent)
  },
  {
    path: 'teams',
    loadComponent: () => import('./teams/teams.component').then(c => c.TeamsComponent)
  },
  {
    path: 'race/:id/:name',
    loadComponent: () => import('./race/race.component').then(c => c.RaceComponent)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
