/********************************************
 * WebViewQuillViewer.js
 * A Delta viewer suitable for viewing output from a Quill.js
 * editor.  The Delta format is discussed here: https://quilljs.com/docs/delta/
 * This component is useful for applications that must avoid using native code
 *
 */
import React from 'react';
import { View, ActivityIndicator, StyleSheet, WebView } from 'react-native';
import PropTypes from 'prop-types';
import renderIf from 'render-if';

// path to the file that the webview will load
const INDEX_FILE = require(`./assets/assets/dist/reactQuillViewer-index.html`);

const MESSAGE_PREFIX = 'react-native-webview-quilljs';

export default class WebViewQuillViewer extends React.Component {
  constructor() {
    super();
    this.webview = null;
    this.state = {
      webViewNotLoaded: true, // flag to show activity indicator
      webViewFilesNotAvailable: true
    };
  }

  webViewDownloadStatusCallBack = message => {
    console.log(message);
  };

  createWebViewRef = webview => {
    this.webview = webview;
  };

  handleMessage = event => {
    let msgData;
    try {
      msgData = JSON.parse(event.nativeEvent.data);
      if (msgData.hasOwnProperty('prefix') && msgData.prefix === MESSAGE_PREFIX) {
        // console.log(`WebViewQuillEditor: received message ${msgData.type}`);
        this.sendMessage('MESSAGE_ACKNOWLEDGED');
        // console.log(`WebViewQuillEditor: sent MESSAGE_ACKNOWLEDGED`);

        switch (msgData.type) {
          case 'VIEWER_LOADED':
            this.viewerLoaded();
            break;
          default:
            console.warn(
              `WebViewQuillViewer Error: Unhandled message type received "${msgData.type}"`
            );
        }
      }
    } catch (err) {
      console.warn(err);
      return;
    }
  };

  onWebViewLoaded = () => {
    this.setState({ webViewNotLoaded: false });
    this.sendMessage('LOAD_VIEWER', {
      theme: this.props.theme
    });
    if (this.props.hasOwnProperty('backgroundColor')) {
      this.sendMessage('SET_BACKGROUND_COLOR', {
        backgroundColor: this.props.backgroundColor
      });
    }
  };

  viewerLoaded = () => {
    // send the content to the editor if we have it
    if (this.props.hasOwnProperty('contentToDisplay')) {
      this.sendMessage('SET_CONTENTS', {
        ops: this.props.contentToDisplay
      });
    }
    if (this.props.hasOwnProperty('htmlContentToDisplay')) {
      this.sendMessage('SET_HTML_CONTENTS', {
        html: this.props.htmlContentToDisplay
      });
    }
  };

  sendContentToViewer = delta => {
    this.sendMessage('SET_CONTENTS', {
      ops: delta.ops
    });
  };

  sendMessage = (type, payload) => {
    // only send message when webview is loaded
    if (this.webview) {
      console.log(`WebViewQuillViewer: sending message ${type}`);
      this.webview.postMessage(
        JSON.stringify({
          prefix: MESSAGE_PREFIX,
          type,
          payload
        }),
        '*'
      );
    }
  };

  showLoadingIndicator = () => {
    return (
      <View style={styles.activityOverlayStyle}>
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator size="large" animating={this.state.webViewNotLoaded} color="green" />
        </View>
      </View>
    );
  };

  onError = error => {
    Alert.alert('WebView onError', error, [
      { text: 'OK', onPress: () => console.log('OK Pressed') }
    ]);
  };

  renderError = error => {
    Alert.alert('WebView renderError', error, [
      { text: 'OK', onPress: () => console.log('OK Pressed') }
    ]);
  };

  render = () => {
    return (
      <View
        style={{
          flex: 1
        }}
      >
        <WebView
          style={{ ...StyleSheet.absoluteFillObject }}
          ref={this.createWebViewRef}
          source={INDEX_FILE}
          onLoadEnd={this.onWebViewLoaded}
          onMessage={this.handleMessage}
          startInLoadingState={true}
          renderLoading={this.showLoadingIndicator}
          renderError={this.renderError}
          javaScriptEnabled={true}
          onError={this.onError}
          scalesPageToFit={false}
          mixedContentMode={'always'}
        />
      </View>
    );
  };
}

WebViewQuillViewer.propTypes = {
  contentToDisplay: PropTypes.object,
  backgroundColor: PropTypes.string
};

// Specifies the default values for props:
WebViewQuillViewer.defaultProps = {
  theme: 'bubble'
};

const styles = StyleSheet.create({
  activityOverlayStyle: {
    ...StyleSheet.absoluteFillObject,
    marginHorizontal: 20,
    marginVertical: 60,
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    borderRadius: 5
  },
  activityIndicatorContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 50,
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowRadius: 5,
    shadowOpacity: 1.0
  }
});
