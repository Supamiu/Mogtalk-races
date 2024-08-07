import {Component, inject} from '@angular/core';
import {RaceService} from "../database/race.service";
import {orderBy, Timestamp, where} from "@angular/fire/firestore";
import {map, of, shareReplay, switchMap} from "rxjs";
import {AsyncPipe, DatePipe, UpperCasePipe} from "@angular/common";
import {LeaderboardComponent} from "../leaderboard/leaderboard.component";
import {NzFlexDirective} from "ng-zorro-antd/flex";
import {NzDividerComponent} from "ng-zorro-antd/divider";
import {NzEmptyComponent} from "ng-zorro-antd/empty";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzPopconfirmDirective} from "ng-zorro-antd/popconfirm";
import {NzSpaceComponent} from "ng-zorro-antd/space";
import {NzSpinComponent} from "ng-zorro-antd/spin";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    AsyncPipe,
    LeaderboardComponent,
    NzFlexDirective,
    NzDividerComponent,
    NzEmptyComponent,
    DatePipe,
    NzButtonComponent,
    NzPopconfirmDirective,
    NzSpaceComponent,
    NzSpinComponent,
    UpperCasePipe
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.less'
})
export class HomeComponent {
  #raceService = inject(RaceService)

  runningRace$ = this.#raceService.query(where('start', '<=', Timestamp.now())).pipe(
    switchMap(startedRaces => {
      const race = startedRaces.filter(r => !r.stopped)[0];
      if (!race) {
        return this.#raceService.query(where('start', '>', Timestamp.now()), orderBy('start')).pipe(
          map(races => races[0] ? races[0] : startedRaces[0])
        )
      }
      return of(race)
    }),
    shareReplay(1)
  )

}
