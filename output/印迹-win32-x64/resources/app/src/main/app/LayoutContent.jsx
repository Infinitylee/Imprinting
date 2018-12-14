import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Layout, Row, Col } from 'antd';
import { Resizable, ResizableBox } from 'react-resizable';
import Outline from './content/Outline';
import WorkPart from './content/WorkPart';
const { Content } = Layout;

class LayoutContent extends Component {

  static defaultProps = { };
  
  constructor(props) {
    super(props);
    this.state = { };
  };

  render() {
    return (
      <Content style={{ height: '100%', overflow: 'initial', background: '#f0f2f5' }}>
        <Row style={{ height: '100%' }}>
          <Col span={6} style={{ height: '100%' }}><Outline /></Col>
          <Col span={18} style={{ height: '100%' }}><WorkPart /></Col>
          {/* <ResizableBox className="box" width={200} height={200} axis="x">
            <span className="text">Only resizable by "x" axis.</span>
          </ResizableBox>
          <ResizableBox className="box" width={200} height={200} axis="x">
            <span className="text">Only resizable by "x" axis.</span>
          </ResizableBox> */}
        </Row>
      </Content>
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

export default connect(mapStateToProps, mapDispatchToProps)(LayoutContent);
