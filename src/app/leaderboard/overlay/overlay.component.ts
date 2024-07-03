import {Component, inject} from '@angular/core';
import {LeaderboardComponent} from "../leaderboard.component";
import {RaceService} from "../../database/race.service";
import {Timestamp, where} from "@angular/fire/firestore";
import {map, shareReplay} from "rxjs";
import {AsyncPipe} from "@angular/common";

@Component({
  selector: 'app-overlay',
  standalone: true,
  imports: [
    LeaderboardComponent,
    AsyncPipe
  ],
  templateUrl: './overlay.component.html',
  styleUrl: './overlay.component.less'
})
export class OverlayComponent {
  #raceService = inject(RaceService)

  runningRace$ = this.#raceService.query(where('start', '<=', Timestamp.now())).pipe(
    map(races => {
      return races.filter(r => !r.stopped)[0]
    }),
    shareReplay(1)
  )
}
