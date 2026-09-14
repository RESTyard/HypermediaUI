import { Component, OnInit, inject } from '@angular/core';
import { MatDialogRef} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsService } from '../services/settings.service';

@Component({
    selector: 'app-settings-view',
    templateUrl: './settings-view.component.html',
    styleUrls: ['./settings-view.component.scss'],
    standalone: false
})
export class SettingsViewComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject<MatDialogRef<SettingsViewComponent>>(MatDialogRef);


  ngOnInit(): void {
    this.dialogRef.afterClosed().subscribe(() => {
      this.settingsService.SaveCurrentSettings();
      this.snackBar.open("Settings saved.");
    })
  }

}
