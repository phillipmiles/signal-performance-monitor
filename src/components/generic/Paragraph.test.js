import React from 'react';
import { render, screen } from '@testing-library/react';
import Paragraph from './Paragraph';

describe('Paragraph', () => {
  test('Displays text', async () => {
    render(<Paragraph>Hello world</Paragraph>);
    expect(screen.getByText('Hello world')).toBeTruthy();
  });
});
