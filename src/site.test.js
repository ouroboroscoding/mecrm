import React from 'react';
import { render } from '@testing-library/react';
import Site from './site';

test('renders learn react link', () => {
  const { getByText } = render(<Site />);
  const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
