/**
 * Users controlpanel container.
 * @module components/manage/Controlpanels/AddonsControlpanel
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router';
import { Portal } from 'react-portal';
import { Accordion, Button, Divider, Header, Icon, Label, Message, Segment } from 'semantic-ui-react';
import jwtDecode from 'jwt-decode';
import {
  FormattedMessage,
  defineMessages,
  injectIntl,
  intlShape,
} from 'react-intl';

import { listAddons } from '../../../actions';
import { getBaseUrl } from '../../../helpers';
import { Toolbar } from '../../../components';

const messages = defineMessages({
  activateAndDeactivate: {
    id: 'Activate and deactivate',
    defaultMessage: 'Activate and deactivate add-ons in the lists below.',
  },
  addAddons: {
    id: 'Add Addons',
    defaultMessage: 'To make new add-ons show up here, add them to your buildout configuration, run buildout, and restart the server process. For detailed instructions see',
  },
  addonsSettings: {
    id: 'Add-ons Settings',
    defaultMessage: 'Add-ons Settings',
  },
  available: {
    id: 'Available',
    defaultMessage: 'Available',
  },
  back: {
    id: 'Back',
    defaultMessage: 'Back',
  },
  installed: {
    id: 'Installed',
    defaultMessage: 'Installed',
  },
  installedVersion: {
    id: 'Installed Version',
    defaultMessage: 'Installed Version',
  },
  update: {
    id: 'Update',
    defaultMessage: 'Update',
  },
  updatesAvailable: {
    id: 'Updates available',
    defaultMessage: 'Updates available',
  },
  updateInstalledAddons: {
    id: 'Update installed addons:',
    defaultMessage: 'Update installed addons:',
  },
  uninstall: {
    id: 'Uninstall',
    defaultMessage: 'Uninstall',
  },
});

@injectIntl
@connect(
  (state, props) => ({
    installedAddons: state.addons.installedAddons,
    availableAddons: state.addons.availableAddons,
    upgradableAddons: state.addons.upgradableAddons,
    activeIndex: state.activeIndex,
    pathname: props.location.pathname,
  }),
  dispatch => bindActionCreators({ listAddons }, dispatch),
)
/**
 * AddonsControlpanel class.
 * @class AddonsControlpanel
 * @extends Component
 */
export default class AddonsControlpanel extends Component {
  /**
   * Property types.
   * @property {Object} propTypes Property types.
   * @static
   */
  static propTypes = {
    listAddons: PropTypes.func.isRequired,
    installedAddons: PropTypes.arrayOf(
      PropTypes.shape({
        '@id': PropTypes.string,
        'id': PropTypes.string,
        'title': PropTypes.string,
        'version': PropTypes.string,
        'description': PropTypes.string,
        'upgrade_info': PropTypes.shape({
          'available': PropTypes.boolean
        })
      })
    ).isRequired,
    availableAddons: PropTypes.arrayOf(
      PropTypes.shape({
        '@id': PropTypes.string,
        'id': PropTypes.string,
        'title': PropTypes.string,
        'version': PropTypes.string,
        'description': PropTypes.string,
        'upgrade_info': PropTypes.shape({
          'available': PropTypes.boolean
        })
      })
    ).isRequired,
    upgradableAddons: PropTypes.arrayOf(
      PropTypes.shape({
        '@id': PropTypes.string,
        'id': PropTypes.string,
        'title': PropTypes.string,
        'version': PropTypes.string,
        'description': PropTypes.string,
        'upgrade_info': PropTypes.shape({
          'available': PropTypes.boolean
        })
      })
    ).isRequired,
  };

  /**
   * Constructor
   * @method constructor
   * @param {Object} props Component properties
   * @constructs Sharing
   */
  constructor(props) {
    super(props);
    this.onAccordionClick = this.onAccordionClick.bind(this);
    this.state = {
      activeIndex: -1,
      installedAddons: [],
      availableAddons: [],
      upgradableAddons: [],
    };
  }

  /**
   * On accordion click handler
   * @method onAccordionClick
   * @param {object} event Event object.
   * @returns {undefined}
   */
  onAccordionClick(event, titleProps) {
    const { index } = titleProps
    const { activeIndex } = this.state.activeIndex
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex })
  }

  /**
   * Component will mount
   * @method componentWillMount
   * @returns {undefined}
   */
  componentWillMount() {
    console.log('in componentWillMount');
    this.props.listAddons();
  }

  /**
   * Render method.
   * @method render
   * @returns {string} Markup for the component.
   */
  render() {

    return (
      <div id="page-addons">
        <Helmet title="Addons" />
        <Segment.Group raised>

            <Segment className="primary">
              <FormattedMessage
                id="Add-ons Settings"
                defaultMessage="Add-ons Settings"
              />
            </Segment>

            {this.props.upgradableAddons.length && (
                <Message
                  icon="info"
                  attached
                  header={this.props.intl.formatMessage(messages.updatesAvailable)}
                  content={this.props.intl.formatMessage(
                    messages.updateInstalledAddons,
                  )}

                />
            )}

            <Segment>
              <Header as="h3">
                <FormattedMessage
                  id="Activate and deactivate"
                  defaultMessage="Activate and deactivate add-ons in the lists below."
                />
              </Header>
              <FormattedMessage
                id="Add Addons"
                defaultMessage="To make new add-ons show up here, add them to your buildout configuration, run buildout, and restart the server process. For detailed instructions see"
              />&nbsp;
              <Link to="http://docs.plone.org/manage/installing/installing_addons.html">Installing a third party add-on</Link>.
            </Segment>

          <Segment key={`header-installed`} secondary>
            <FormattedMessage
              id="Installed"
              defaultMessage="Installed"
            />:
            <Label circular>{this.props.installedAddons.length}</Label>
          </Segment>

          <Segment key={`body-installed`} attached>
            <Accordion>
              <Divider />
              {this.props.installedAddons.map((item, i) => (
                <div>
                  <Accordion.Title active={this.state.activeIndex === i} index={i} onClick={this.onAccordionClick}>
                    {item.title}
                    {item.upgrade_info['available'] && (
                      <Label as='a'>
                        <Icon name='circle' />
                        <FormattedMessage
                          id="Update"
                          defaultMessage="Update"
                        />
                      </Label>
                    )}
                    <Icon name='dropdown' floated='right' />
                  </Accordion.Title>
                  <Accordion.Content active={this.state.activeIndex === i}>
                    {item.description}
                      <FormattedMessage
                        id="Installed Version"
                        defaultMessage="Installed Version"
                      />&nbsp;

                      {item.version}


                      {item.upgrade_info['available'] && (
                        <Button primary>
                          <FormattedMessage
                            id="Update"
                            defaultMessage="Update"
                          />
                        </Button>
                      )}

                      <Button primary>
                        <FormattedMessage
                          id="Uninstall"
                          defaultMessage="Uninstall"
                        />
                      </Button>

                  </Accordion.Content>
                  <Divider />
                </div>
              ))}
            </Accordion>
          </Segment>

          <Segment key={`header-available`} secondary>
            <FormattedMessage
              id="Available"
              defaultMessage="Available"
            />:
            <Label circular>{this.props.availableAddons.length}</Label>
          </Segment>

          <Segment key={`body-available`} attached>
            <Accordion>
              <Divider />
              {this.props.availableAddons.map((item, j) => (
                <div>
                  <Accordion.Title active={this.state.activeIndex === j} index={j} onClick={this.onAccordionClick}>
                    {item.title}
                    <Icon name='dropdown' floated='right' />
                  </Accordion.Title>
                  <Accordion.Content active={this.state.activeIndex === j}>
                    {item.description}

                      <FormattedMessage
                        id="Installed Version"
                        defaultMessage="Installed Version"
                      />

                      {item.version}
                      <Button primary>
                        <FormattedMessage
                          id="Install"
                          defaultMessage="Install"
                        />
                      </Button>

                  </Accordion.Content>
                  <Divider />
                </div>
              ))}
            </Accordion>
          </Segment>

        </Segment.Group>

        <Portal node={__CLIENT__ && document.getElementById('toolbar')}>
          <Toolbar
            pathname={this.props.pathname}
            inner={
              <Link to={`${getBaseUrl(this.props.pathname)}`} className="item">
                <Icon
                  name="arrow left"
                  size="big"
                  color="blue"
                  title={this.props.intl.formatMessage(messages.back)}
                />
              </Link>
            }
          />
        </Portal>
      </div>
    );
  }
}
