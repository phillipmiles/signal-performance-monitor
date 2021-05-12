import React, { useCallback } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import useForm from './useForm';

const formValidationRules = {
  email: [
    {
      rule: 'hasMinLength',
      param: 1,
      errorMsg: 'Please enter a valid email address.',
    },
    {
      rule: 'isEmail',
      errorMsg: 'Please enter a valid email address.',
    },
  ],
};

const formInitValues = {
  email: '',
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function TestComponent({ async }) {
  const formOnSubmit = useCallback(
    ({ inputValues }) => {
      const asyncLogin = async () => {
        await sleep(500);
        return true;
      };
      if (async) {
        return asyncLogin();
      } else {
        asyncLogin();
      }
    },
    [async],
  );

  const { formState, handleChange, handleSubmit } = useForm(
    formInitValues,
    formOnSubmit,
    formValidationRules,
  );

  const handleChangeEmail = useCallback(
    (event) => handleChange('email', event.target.value),

    [handleChange],
  );

  return (
    <div>
      {formState.hasSubmitted && <p>Has submitted!</p>}
      {formState.submitSuccess && <p>Submit success!</p>}
      <input
        onChange={handleChangeEmail}
        value={formState.inputValues.email}
        aria-label="email-input"
      />

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

describe('useForm', () => {
  test('Displays text', async () => {
    const { getByText, getByLabelText } = render(<TestComponent />);
    const emailInput = getByLabelText('email-input');
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.click(getByText('Submit'));
    expect(emailInput.value).toBe('test@test.com');
    expect(getByText('Has submitted!')).toBeTruthy();
  });
  test('Async state', async () => {
    const { getByText, getByLabelText } = render(<TestComponent async />);
    const emailInput = getByLabelText('email-input');
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.click(getByText('Submit'));
    await waitFor(() => expect(getByText('Submit success!')).toBeTruthy());
  });
});
