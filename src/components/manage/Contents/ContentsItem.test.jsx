import React from 'react';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { ContentsItemComponent as ContentsItem } from './ContentsItem';

const mockStore = configureStore();

describe('ContentsItem', () => {
  it('renders a contents item component', () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
    });
    const component = renderer.create(
      <Provider store={store}>
        <Router>
          <ContentsItem
            item={{
              '@id': '/blog',
              title: 'Blog',
              is_folderish: false,
              '@type': 'Document',
            }}
            selected={false}
            onClick={() => {}}
            indexes={[
              {
                id: 'title',
                type: 'string',
              },
            ]}
            onCut={() => {}}
            onCopy={() => {}}
            onDelete={() => {}}
            onMoveToTop={() => {}}
            onMoveToBottom={() => {}}
            onOrderItem={() => {}}
            connectDragSource={x => x}
            connectDragPreview={x => x}
            connectDropTarget={x => x}
            order={1}
            isDragging={false}
          />
        </Router>
      </Provider>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});
