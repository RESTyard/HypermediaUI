import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize',
  standalone: false
})
export class FileSizePipe implements PipeTransform {
  private readonly units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  transform(bytes: number | undefined | null): string {
    if (bytes === undefined || bytes === null || isNaN(bytes)) {
      return '';
    }

    if (bytes === 0) {
      return '0 B';
    }

    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + this.units[i];
  }
}
