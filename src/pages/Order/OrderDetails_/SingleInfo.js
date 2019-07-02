import React, { PureComponent } from 'react';
import {
  Card,
  Button,
  Form,
  Icon,
  Col,
  Row,
  DatePicker,
  Input,
  Select,
  Popover,
  Radio,
  Tabs,
  Tooltip,
} from 'antd';
import { connect } from 'dva';
import FooterToolbar from '@/components/FooterToolbar';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import TableForm from './TableForm';
import TabPanesForm from './TabPanesForm';
import ModalAddress from './ModalAddress';
import styles from './OrderDetails.less';

const TabPane = Tabs.TabPane;
const tableData = [
  {
    key: '1',
    workId: '00001',
    name: 'John Brown',
    department: 'New York No. 1 Lake Park',
  },
  {
    key: '2',
    workId: '00002',
    name: 'Jim Green',
    department: 'London No. 1 Lake Park',
  },
  {
    key: '3',
    workId: '00003',
    name: 'Joe Black',
    department: 'Sidney No. 1 Lake Park',
  },
];

const Label = React.forwardRef(({ value }, ref) => <span ref={ref}>{value}</span>);

@connect(({ order_details, loading }) => ({
  order_details,
  submitting: loading.effects['order_details/submitAdvancedForm'],
  shippingAddress: loading.effects['order_details/getShippingAddress'],
}))
@Form.create()
class SingleInfo extends PureComponent {
  constructor(props) {
    super(props);
    this.newTabIndex = 1;
    this.tabForm = this.props.form;
    const panes = [
      {
        title: '分单地址1',
        content: <TabPanesForm index={this.newTabIndex} tabform={this.tabForm} />,
        key: '1',
        closable: false,
      },
    ];
    this.state = {
      width: '100%',
      activeKey: panes[0].key,
      panes,
      list: [],
      display_name: true,
      modalVisible: false,
    };
  }

  //  新增或删除
  onEditTabs = (targetKey, action) => {
    this[action](targetKey);
  };

  //  添加
  add = () => {
    this.newTabIndex += 1;
    const panes = this.state.panes;
    const activeKey = `newTab${this.newTabIndex}`;
    panes.push({
      title: `分单地址${this.newTabIndex}`,
      content: (
        <TabPanesForm
          index={this.newTabIndex}
          tabform={this.tabForm}
          wrappedComponentRef={form => (this.formRef = form)}
        />
      ),
      key: activeKey,
    });
    this.setState({ panes, activeKey });
  };

  remove = targetKey => {
    let activeKey = this.state.activeKey;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    if (panes.length && activeKey === targetKey) {
      if (lastIndex >= 0) {
        activeKey = panes[lastIndex].key;
      } else {
        activeKey = panes[0].key;
      }
    }
    this.setState({ panes, activeKey });
  };

  //  在组件完成更新后立即调用
  componentDidMount() {
    window.addEventListener('resize', this.resizeFooterToolbar, { passive: true }); // 添加监听
    const { dispatch, match } = this.props;
    const { params } = match;
    console.log(params.length);
    dispatch({
      type: 'order_details/getShippingAddress',
      callback: res => {
        this.setState({
          list: res,
        });
      },
    });
    if (Object.keys(params).length === 0) {
    } else {
    }
    //  dispatch({
    //    type: 'profile/fetchBasic',
    //    payload: params.id || '1000000000',
    //  });
  }

  //  在组件从 DOM 中移除之前立刻被调用
  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeFooterToolbar);
  }

  //  错误集合
  getErrorInfo = () => {
    const {
      form: { getFieldsError },
    } = this.props;
    const errors = getFieldsError();
    const errorCount = Object.keys(errors).filter(key => errors[key]).length;
    if (!errors || errorCount === 0) {
      return null;
    }
    const scrollToField = fieldKey => {
      const labelNode = document.querySelector(`label[for="${fieldKey}"]`);
      if (labelNode) {
        labelNode.scrollIntoView(true);
      }
    };
    const errorList = Object.keys(errors).map(key => {
      if (!errors[key]) {
        return null;
      }
      return (
        <li key={key} className={styles.errorListItem} onClick={() => scrollToField(key)}>
          <Icon type="cross-circle-o" className={styles.errorIcon} />
          <div className={styles.errorMessage}>{errors[key][0]}</div>
          {/* <div className={styles.errorField}>{fieldLabels[key]}</div> */}
        </li>
      );
    });
    return (
      <span className={styles.errorIcon}>
        <Popover
          title="表单校验信息"
          content={errorList}
          overlayClassName={styles.errorPopover}
          trigger="click"
          getPopupContainer={trigger => trigger.parentNode}
        >
          <Icon type="exclamation-circle" />
        </Popover>
        {errorCount}
      </span>
    );
  };

  //   根据游览器变换宽度
  resizeFooterToolbar = () => {
    requestAnimationFrame(() => {
      const sider = document.querySelectorAll('.ant-layout-sider')[0]; //  获取文档中 id="" 的元素：
      if (sider) {
        const width = `calc(100% - ${sider.style.width})`;
        const { width: stateWidth } = this.state;
        if (stateWidth !== width) {
          this.setState({ width });
        }
      }
    });
  };

  //  验证提交
  validate = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      console.log(values);
      dispatch({
        type: 'order_details/submitOrderDetails',
        payload: values,
      });
      if (!error) {
        //  submit the values
        dispatch({
          type: 'order_details/submitOrderDetails',
          payload: values,
        });
      }
    });
  };

  onRadioChange = e => {
    //  this.setState({
    //    display_name: e.target.value === "true",
    //  });
    // 调用接口
    // dispatch({
    //   type: 'order_details/getShippingAddress',
    //   callback: res => {
    //     this.setState({
    //       list: res,
    //     });
    //   },
    // });
    if (e.target.value === 'true') {
      this.setState({
        display_name: true,
        list: tableListDataSource,
      });
    } else {
      this.setState({
        display_name: false,
        list: tableListDataSource,
      });
    }
  };

  // 弹出对话框show hide
  handleModalVisible = flag => {
    const { dispatch } = this.props;
    if (flag) {
      dispatch({
        type: 'administrator/getcustomer',
      });
    }
    this.setState({
      modalVisible: !!flag,
    });
  };

  //  遍历下拉框
  getOption = () => {
    const {
      list: { tableListDataSource },
    } = this.state;

    //  获取下拉框提货地址
    if (!tableListDataSource || tableListDataSource.length < 1)
      return (
        <Select.Option key={0} value={0}>
          没有找到选项
        </Select.Option>
      );
    return tableListDataSource.map(item => (
      <Select.Option key={item.id} value={item.name}>
        {item.name}
      </Select.Option>
    ));
  };

  optionChange = (value, key) => {
    const {
      list: { tableListDataSource },
    } = this.state;
    const {
      form: { setFieldsValue },
    } = this.props;
    Object.values(tableListDataSource).map(val => {
      if (val.id === parseInt(key)) {
        setFieldsValue({ uname: val.uname, iPhone: val.iPhone });
      }
    });
  };

  isTiHuoYes = () => {
    const {
      form: { getFieldDecorator },
      shippingAddress,
    } = this.props;
    return (
      <div>
        <Row>
          <Col md={12} sm={24}>
            <Form.Item label="提货地址">
              {getFieldDecorator('name', {
                rules: [{ required: true, message: '提货地址' }],
              })(
                <Select
                  placeholder="请选择提货地址"
                  onChange={(value, option) => this.optionChange(value, option.key)}
                  loading={shippingAddress}
                >
                  {this.getOption()}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col md={12} sm={24}>
            <a onClick={() => this.handleModalVisible(true)}>管理提货地址</a>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <Form.Item label="联系人">{getFieldDecorator('TakeDriver')(<Label />)}</Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <Form.Item label="电话">{getFieldDecorator('DriverPho')(<Label />)}</Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <Form.Item label="提货时间">
              {getFieldDecorator('PreArrivedTime', {
                rules: [{ required: true, message: '请选择提货时间' }],
              })(<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />)}
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  };

  isTiHuoNo = () => {
    const {
      form: { getFieldDecorator },
      shippingAddress,
    } = this.props;
    return (
      <div>
        <Row>
          <Col md={12} sm={24}>
            <Form.Item label="选择送货仓库">
              {getFieldDecorator('songhuocangku', {
                rules: [{ required: true, message: '选择送货仓库' }],
              })(
                <Select loading={shippingAddress} placeholder="选择送货仓库">
                  {this.getOption()}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <Form.Item label="仓库地址">
              {getFieldDecorator('dizhi', {
                rules: [{ required: true, message: '请选择仓库地址' }],
              })(<DatePicker />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <Form.Item label="联系人电话">
              {getFieldDecorator('dianhuan', {
                rules: [{ required: true, message: '请选择联系人电话' }],
              })(<DatePicker />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <Form.Item label="入仓日期">
              {getFieldDecorator('rucang', {
                rules: [{ required: true, message: '请选择入仓日期' }],
              })(<DatePicker format="YYYY-MM-DD" />)}
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  };

  render() {
    const {
      form: { getFieldDecorator },
      submitting,
    } = this.props;
    const { width, modalVisible } = this.state;
    const Methods = {
      handleModalVisible: this.handleModalVisible,
      modalVisible: modalVisible,
      modalClike: this.modalClike,
      data: tableData,
    };
    return (
      <PageHeaderWrapper title="新建订单" wrapperClassName={styles.advancedForm}>
        <Card title="初始信息" className={styles.card} bordered={false}>
          <Form layout="inline">
            <Row>
              <Col md={12} sm={24}>
                <Form.Item
                  label={
                    <span>
                      上门提货
                      <Tooltip title="请打印一至两份入仓单,让司机携带入仓或者贴在外箱上,别遮住原有标签。">
                        <Icon type="info-circle-o" style={{ marginLeft: 4 }} />
                      </Tooltip>
                    </span>
                  }
                >
                  {getFieldDecorator('tihuo', {
                    rules: [{ required: true }],
                    initialValue: 'true',
                  })(
                    <Radio.Group onChange={e => this.onRadioChange(e)}>
                      <Radio value="true">是</Radio>
                      <Radio value="false">否</Radio>
                    </Radio.Group>
                  )}
                </Form.Item>
              </Col>
            </Row>
            {this.state.display_name ? this.isTiHuoYes() : this.isTiHuoNo()}
            <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
              <Col md={8} sm={24}>
                <Form.Item label="备注">
                  {getFieldDecorator('Remark' )(
                    <Input.TextArea placeholder="请输入备注" />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>bing
        </Card>
        <Form layout="inline" className={styles.advancedForm}>
          <Tabs
            type="editable-card"
            hideAdd={false}
            onChange={this.onChange}
            onEdit={this.onEditTabs}
            className={styles.tabslist}
          >
            {this.state.panes.map(pane => (
              <TabPane tab={pane.title} key={pane.key} forceRender={true} closable={pane.closable}>
                {pane.content}
              </TabPane>
            ))}
          </Tabs>
        </Form>
        <Card title="货物信息" bordered={false}>
          {getFieldDecorator('members', {
            initialValue: tableData,
          })(<TableForm />)}
        </Card>
        <FooterToolbar style={{ width }}>
          {this.getErrorInfo()}
          <Button type="primary">
            保存
          </Button>
          <Button type="primary" onClick={this.validate} loading={submitting}>
            提交
          </Button>
        </FooterToolbar>
        <ModalAddress {...Methods} />
      </PageHeaderWrapper>
    );
  }
}
export default SingleInfo;
