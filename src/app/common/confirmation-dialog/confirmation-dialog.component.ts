import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

export interface ConfirmationDialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
  standalone: false
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

export function doWithConfirmation(configs: HypermediaUI.IActionClassConfiguration[], dialog: MatDialog, doAction: () => void) {
  if (configs.length > 0) {
    const config = configs[0];
    const dialogRef = dialog.open(ConfirmationDialogComponent, {
      data: {
        title: config.title,
        message: config.message
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        doWithConfirmation(configs.slice(1), dialog, doAction);
      }
    });
  } else {
    doAction();
  }
}
