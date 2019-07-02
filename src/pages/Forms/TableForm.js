import React, { PureComponent } from 'react';
import { Button, Input, Card, Form, Tabs } from 'antd'; 
import TabPanesForm from './BasicForm';
const TabPane = Tabs.TabPane;

@Form.create()
class TableForm extends PureComponent {
  constructor(props) {
    super(props);
    this.newTabIndex = 1;
    const panes = [
      {
        title: '地址1',
        content: <TabPanesForm
          dispatch={this.props.dispatch}
          index={this.newTabIndex}
          tabform={this.props.form}
        />,
        key: '1',
        closable: false,
      },
    ];
    this.state = {
      activeKey: panes[0].key,
      panes,
    };
  }

  //  添加
  add = () => {
    this.newTabIndex += 1;
    const panes = this.state.panes;
    const activeKey = `newTab${this.newTabIndex}`; 
    panes.push({
      title: `地址${this.newTabIndex}`,
      content: (
        <TabPanesForm
          dispatch={this.props.dispatch}
          index={this.newTabIndex}
          tabform={this.props.form}
        />
      ),
      key: activeKey,
    });
    this.setState({ panes, activeKey });
  };

  //  新增或删除
  onEditTabs = (targetKey, action) => {
    this[action](targetKey);
  };

  validate = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props; 
    validateFieldsAndScroll((error, values) => {
    console.log(values);
    })
  }

  render() {
    debugger
    return (
      <Card>
        <Tabs
          type='editable-card'
          hideAdd={false} 
          onEdit={this.onEditTabs} 
        >
          {this.state.panes.map((pane) => (
            <TabPane forceRender tab={pane.title} key={pane.key} closable={pane.closable}>
              {pane.content}
            </TabPane>
          ))}
        </Tabs>
        <Button type="primary" onClick={this.validate} >
            保存
          </Button>
      </Card>

      
    );
  }
}

export default TableForm;
