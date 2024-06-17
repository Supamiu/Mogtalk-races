import {Component, inject} from '@angular/core';
import {RaceService} from "../database/race.service";
import {Timestamp, where} from "@angular/fire/firestore";
import {map} from "rxjs";
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
    map(races => {
      return races.filter(r => !r.stopped)[0]
    })
  )

}
