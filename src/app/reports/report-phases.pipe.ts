import {inject, Pipe, PipeTransform} from '@angular/core';
import {map, Observable} from "rxjs";
import {RaceService} from "../database/race.service";

@Pipe({
  name: 'reportPhases',
  standalone: true
})
export class ReportPhasesPipe implements PipeTransform {

  #raceService = inject(RaceService);

  transform(raceId: string): Observable<string[]> {
    return this.#raceService.getOne(raceId).pipe(
      map(race => race.phases)
    );
  }

}
