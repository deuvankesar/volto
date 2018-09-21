import React from 'react';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import TabularView from './TabularView';

const mockStore = configureStore();

describe('TabularView', () => {
  it('renders a tabular view component', () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
    });
    const component = renderer.create(
      <Provider store={store}>
        <Router>
          <TabularView
            content={{
              title: 'Hello World!',
              description: 'Hi',
              items: [
                {
                  title: 'My item',
                  description: 'My item description',
                  url: 'http://item',
                },
              ],
            }}
          />
        </Router>
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});
