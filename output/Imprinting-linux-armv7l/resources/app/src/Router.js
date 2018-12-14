import React, { Component } from 'react';
import App from './App';
import { connect } from 'react-redux';
import { HashRouter, Switch, Route } from 'react-router-dom';

class Router extends Component {

  static defaultProps = { };
  
  constructor(props) {
    super(props);
    this.state = { };
  };

  componentWillMount() { }

  render() {
    return (
      <HashRouter>
        <Switch>
          <Route exact path="/" component={App}/>
          {/* {
            this.props.token !== undefined ? (<Route exact path="/app" component={App}/>) : null
          } */}
          {/* <Route component={Exception} /> */}
        </Switch>
      </HashRouter>
    );
  }
}

// mapStateToProps:将state映射到组件的props中
const mapStateToProps = (state) => {
  return { }
}

// mapDispatchToProps:将dispatch映射到组件的props中
const mapDispatchToProps = (dispatch, ownProps) => {
  return { }
}

export default connect(mapStateToProps, mapDispatchToProps)(Router);
