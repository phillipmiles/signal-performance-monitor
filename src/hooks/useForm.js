import { useReducer, useCallback, useMemo, useEffect } from 'react';

const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';
// Consider changing to FORM_SUBMIT_SUCCESS since i'm begining to handle async submissions.
const FORM_SUBMIT = 'FORM_SUBMIT';
const FORM_SUBMIT_SUCCESS = 'FORM_SUBMIT_SUCCESS';
const FORM_CLEANUP = 'FORM_CLEANUP';

const validateInput = (newValue, validationRules) => {
  let errors = [];
  if (validationRules) {
    validationRules.forEach((rule) => {
      if (!validationFunctions[rule.rule](newValue, rule.param)) {
        errors.push(rule.errorMsg);
      }
    });
  }
  return errors;
};

// Returns the validationRules object. If provided validationRules is a function, feed it the
// latest form values to get the object.
const validationObject = (validationRules, values) => {
  if (typeof validationRules === 'function') {
    return validationRules(values);
  }
  return validationRules;
};

const formReducer = (state, action) => {
  switch (action.type) {
    case FORM_INPUT_UPDATE:
      const newValues = {
        ...state.inputValues,
        [action.input]: action.value,
      };

      const validationRulesObj = validationObject(
        action.validationRules,
        newValues,
      );
      let newValidities = {};
      let newErrors = {};
      let newFormIsValid = true;

      // If we have validation rules, validate all the things.
      if (validationRulesObj) {
        // Validate each input value.
        for (const inputId in newValues) {
          newErrors[inputId] = validateInput(
            newValues[inputId],
            validationRulesObj[inputId],
          );

          // If any error is found mark form as invalid.
          if (newFormIsValid && newErrors[inputId].length > 0) {
            newFormIsValid = false;
          }
          newValidities[inputId] = newErrors[inputId].length === 0;
        }
      } else {
        newValidities = { ...state.inputValidities };
        newErrors = { ...state.inputErrorMessages };
      }

      const newUpdatedSinceLastSubmit = {
        ...state.updatedSinceLastSubmit,
        [action.input]: true,
      };

      return {
        ...state,
        formIsValid: newFormIsValid,
        inputValidities: newValidities,
        inputErrorMessages: newErrors,
        inputValues: newValues,
        updatedSinceLastSubmit: newUpdatedSinceLastSubmit,
      };

    case FORM_SUBMIT:
      let resetUpdatedSinceLastSubmit = {};
      for (const key in state.updatedSinceLastSubmit) {
        resetUpdatedSinceLastSubmit[key] = false;
      }
      return {
        ...state,
        formIsValid: state.formIsValid,
        inputValidities: { ...state.inputValidities },
        inputErrorMessages: { ...state.inputErrorMessages },
        inputValues: { ...state.inputValues },
        updatedSinceLastSubmit: resetUpdatedSinceLastSubmit,
        hasSubmitted: true,
      };

    case FORM_SUBMIT_SUCCESS:
      return {
        ...state,
        submitSuccess: action.success,
      };

    default:
      return state;
  }
};

const validationFunctions = {
  isRequired: (text) => text.trim().length > 0,
  isEmail: (text) => {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (emailRegex.test(text.toLowerCase())) {
      return true;
    }

    return false;
  },
  hasMin: (value, min) => +value >= min,
  hasMax: (value, max) => +value <= max,
  hasMinLength: (value, minLength) => value.length >= minLength,
  isEqualTo: (value, target) => value === target,
  custom: (value, func) => func(value),
};

// const validateForm = (validationRules, inputValues) => {
//   let inputValidities = {};
//   for (const key in inputValues) {
//     errors[key] = validateInput(
//       inputValues[key],
//       validationRules(inputValues)[key],
//     );
//     if (formIsValid && errors[key].length > 0) {
//       formIsValid = false;
//     }
//     inputValidities[key] = errors[key].length === 0;
//     updatedSinceLastSubmit[key] = false;
//   }
//   return;
// };

// Note that initialValuesState, validationRules and onSubmit must be memoized before passing through to
// avoid rerenders re triggering useEffects that depend on the returned formState, handleChange and handleSubmit.
// The passed in onSubmit function will be called with the latest version of the formState passed into as the only parameter.
// Returning a true or false value to onSubmit will cause formState to return whether or not
// the submit function was successful.
const useForm = (
  initialValuesState,
  onSubmit,
  validationRules,
  // onChange
) => {
  const initReducer = useMemo(() => {
    return {
      inputValues: initialValuesState,
      ...(() => {
        let inputValidities = {};
        let formIsValid = true;
        let errors = {};
        let updatedSinceLastSubmit = {};

        for (const key in initialValuesState) {
          errors[key] = validateInput(
            initialValuesState[key],
            validationObject(validationRules, initialValuesState)[key],
          );
          if (formIsValid && errors[key].length > 0) {
            formIsValid = false;
          }
          inputValidities[key] = errors[key].length === 0;
          updatedSinceLastSubmit[key] = false;
        }

        return {
          inputValidities: inputValidities,
          inputErrorMessages: errors,
          formIsValid: formIsValid,
          updatedSinceLastSubmit: updatedSinceLastSubmit,
          // XXX Consider changing to isSubmitting
          hasSubmitted: false,
          submitSuccess: false,
        };
      })(),
    };
  }, [initialValuesState, validationRules]);

  const [formState, dispatchFormState] = useReducer(formReducer, initReducer);

  const handleChange = useCallback(
    (inputId, newValue) => {
      if (!inputId || inputId in initialValuesState !== true) {
        throw Error(
          `Could not find input id '${inputId}'' withinin form state.`,
        );
      }

      dispatchFormState({
        type: FORM_INPUT_UPDATE,
        input: inputId,
        value: newValue,
        validationRules: validationRules,
      });
    },
    [dispatchFormState, validationRules, initialValuesState],
  );

  const handleSubmit = useCallback(
    (event) => {
      const asyncSubmit = async (formState) => {
        if (event) {
          event.preventDefault();
        }
        dispatchFormState({
          type: FORM_SUBMIT,
        });

        if (formState.formIsValid) {
          const successResult = await onSubmit(formState);
          // XXX: WTF! Dispatching after the await and if the onSubmit function results in
          // the unmounting of this useForm hook eg(login success page redirect) causes an
          // error to get logged to console saying that state is trying to update on an
          // unmounted component. Strangly having a useEffect returning a function that
          // interactes with a useReducer or a useState somehow clears the error!!!!
          // No idea why.
          if (successResult !== undefined) {
            dispatchFormState({
              type: FORM_SUBMIT_SUCCESS,
              success: successResult,
            });
          }
          return true;
        }
        return false;
      };

      return asyncSubmit(formState);
    },
    [formState, dispatchFormState, onSubmit],
  );

  // XXX The only point of this useEffect is to stop a state on unmounted component error
  // message getting logged to console. No idea why this fixes it.
  // XXX Uncommenting the fix because the alternative is, if you know the page will unmount,
  // to instead simply not return a true or false value to the onSubmit function.
  // useEffect(() => {
  //   return () => {
  //     dispatchFormState({
  //       type: FORM_CLEANUP,
  //     });
  //   };
  // }, []);

  return {
    formState,
    handleChange,
    handleSubmit,
  };
};

export default useForm;
