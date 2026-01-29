
import {FormlyExtension, FormlyFieldConfig} from "@ngx-formly/core";

// fix forms with arrays do not allow empty arrays to be submitted (which is not null)
export const allowEmptyArrayExtension: FormlyExtension = {
  postPopulate(field: FormlyFieldConfig) {
    const ctrl = field.formControl;

    if (field.type === 'array' && ctrl) {
      // Because the model is initially empty ([]) and the schema says it's required,
      // the FormControl is born with an error.
      // in that case remove to allow input
      if (ctrl.hasError('required')) {
        ctrl.clearValidators();

        // Update UI so the label/asterisk updates
        if (field.props) {
          field.props.required = false;
        }

        // Refresh validity state
        ctrl.updateValueAndValidity({emitEvent: false});

        console.log(`Successfully bypassed 'required' for ${field.key} to allow empty arrays`);
      }
    }
  }
};
