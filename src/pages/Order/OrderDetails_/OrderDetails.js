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
  Table,
} from 'antd';
import { connect } from 'dva';
import FooterToolbar from '@/components/FooterToolbar';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import TableForm from './TableForm';
import TabPanesForm from './TabPanesForm';
import ModalAddress from './ModalAddress';
import styles from './OrderDetails.less';

function test(json) {
  var map = {};
  for (let a in json) {
    for (var i = 0; i < a.length; i++) {
      var index = a.length - i;
      if (a[index - 1] >= 0 && a[index - 1] <= 9) {
        continue;
      }
      var j = map[a.substring(index)];
      if (j == null) {
        j = {};
      }
      j[a.substring(0, index)] = json[a];
      map[a.substring(index)] = j;
      break;
    }
  }
  var keys = Object.keys(map);
  var res = [];
  for (var i = 0; i < keys.length; i++) {
    res[i] = map[keys[i]];
  }
  return res;
}
const TabPane = Tabs.TabPane;
const tableData = [
  {
    key: '1',
    BoxInfoId: '1',
    workId: '00001',
    name: 'John Brown',
    department: 'New York No. 1 Lake Park',
    tiji: 0
  },
];
var timeoutHandler;
const Label = React.forwardRef(({ value }, ref) => <span ref={ref}>{value}</span>);


@connect(({ order_details, loading }) => ({
  order_details,
  submitting: loading.effects['order_details/submitAdvancedForm'],
  shippingAddress: loading.effects['order_details/getShippingAddress'],
}))
@Form.create()
class OrderDetails extends PureComponent {
  constructor(props) {
    super(props);
    this.newTabIndex = 1;
    const panes = [
      {
        title: '分单地址1',
        content: <TabPanesForm
          wrappedComponentRef={(form) => this.form = form}
          order_details={this.props.order_details}
          dispatch={this.props.dispatch}
          tabProps={props.match}
          index={this.newTabIndex}
          tabform={this.props.form}
        />,
        key: '1',
        closable: false,
      },
    ];
    this.state = {
      width: '100%',
      activeKey: panes[0].key,
      panes,
      display_name: true,
      modalVisible: false,
      type: 'editable-card',
      // display:'none',
      TrainOutStatus: 0,
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
    const { match } = this.props;
    panes.push({
      title: `分单地址${this.newTabIndex}`,
      content: (
        <TabPanesForm
          wrappedComponentRef={(form) => this.form = form}
          order_details={this.props.order_details}
          dispatch={this.props.dispatch}
          tabProps={match}
          index={this.newTabIndex}
          tabform={this.props.form}
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
    const { TrainOutStatus } = this.state;
    let state;
    if (Object.keys(params).length === 0) {
      dispatch({
        type: 'order_details/getCustomerPickupAddress',
        payload: {
          Id: localStorage.getItem('OutsideCustomerId')
        }
      });

    } else {
      state = parseInt(params.id);
      this.setState({
        TrainOutStatus: parseInt(params.id)
      })
    }
    if (state === 1 || state === 2) {
      this.setState({
        type: 'card'
      });
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
    // this.state.panes.forEach(element => {
    //   
    //   element.content.forml
    // });



    // this.form.onSubmit();
    // this.child.onSubmit();
    validateFieldsAndScroll((error, values) => {

      console.log(values);
      let t = test(values);
      console.log(test(values));

      let jsones = {
        SingleWorkSheetBasicInfoIn: {},
        ecommerceDeliveryIns: [],
      }

      for (let i = 0; i < t.length - 1; i++) {
        jsones.ecommerceDeliveryIns.push(t[i]);
      }
      jsones.SingleWorkSheetBasicInfoIn = t.pop();

      jsones['TrainOutStatus'] = 1; // 未下单
      jsones['SubmitTime'] = new Date(); // 提交事件
      // TODO: 运费
      jsones['UserId'] = localStorage.getItem('UserId'); //登陆人
      jsones['CustomerId'] = localStorage.getItem('OutsideCustomerId'); //公司
      // TODO: 车牌号
      jsones['CurState'] = 16;// 工作单状态

      console.log(jsones);

      // dispatch({
      //   type: 'order_details/submitOrderDetails',
      //   payload: values,
      // });
      // if (!error) {
      //   //  submit the values
      //   dispatch({
      //     type: 'order_details/submitOrderDetails',
      //     payload: values,
      //   });
      // }
    });
  };



  onRadioChange = e => {
    const {
      dispatch
    } = this.props;
    if (e.target.value === 'true') {
      dispatch({
        type: 'order_details/getCustomerPickupAddress',
        payload: {
          Id: localStorage.getItem('OutsideCustomerId')
        }
      });
      this.setState({ display_name: true });
    } else {
      // TODO:  查询不到数据
      dispatch({
        type: 'order_details/getDomesticWarehouse',
        payload: {
          Id: localStorage.getItem('OutsideCustomerId')
        }
      });
      this.setState({ display_name: false });
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
      order_details: { pickupAddressData },
    } = this.props;

    //  获取下拉框提货地址
    if (!pickupAddressData || pickupAddressData.length < 1)
      return (
        <Select.Option key={0} value={0}>
          没有找到选项
        </Select.Option>
      );
    return pickupAddressData.map(item => (
      <Select.Option key={item.Id} value={item.Id}>
        {item.Addressee}
      </Select.Option>
    ));
  };

  optionChange = (value) => {
    const {
      order_details: { pickupAddressData },
    } = this.props;
    const {
      form: { setFieldsValue },
    } = this.props;
    Object.values(pickupAddressData).map(val => {
      if (val.Id === parseInt(value)) {
        setFieldsValue({ TakeDriver: val.Contact, DriverPho: val.Tel });
      }
    });
  };
  // 送货仓库
  getDeliveryWarehouseOption = () => {
    const {
      order_details: { deliveryWarehouseData },
    } = this.props;
    
    //  获取下拉框提货地址
    if (!deliveryWarehouseData || deliveryWarehouseData.length < 1)
      return (
        <Select.Option key={0} value={0}>
          没有找到选项
        </Select.Option>
      );
    return deliveryWarehouseData.map(item => (
      <Select.Option key={item.Id} value={item.Id}>
        {item.CnName}
      </Select.Option>
    ));
  };

  optiontDeliveryWarehouseChange = (value) => {
    const {
      order_details: { deliveryWarehouseData },
    } = this.props;
    const {
      form: { setFieldsValue },
    } = this.props;
    Object.values(deliveryWarehouseData).map(val => {
      if (val.Id === parseInt(value)) {
        setFieldsValue({
          TakeDriver: val.Contact,
          Adress: val.Adress,
          DriverPho: val.Tel
        });
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
              {getFieldDecorator('CustomerPickupAddressId', {
                rules: [{ required: true, message: '提货地址' }],
              })(
                <Select
                  placeholder="请选择提货地址"
                  onChange={this.optionChange}
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
              {getFieldDecorator('DomesticWarehouseId', {
                rules: [{ required: true, message: '选择送货仓库' }],
              })(
                <Select
                  onChange={this.optiontDeliveryWarehouseChange}
                  loading={shippingAddress}
                  placeholder="选择送货仓库"
                >
                  {this.getDeliveryWarehouseOption()}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <Form.Item label="仓库地址">{getFieldDecorator('Adress')(<Label />)}</Form.Item>
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
            <Form.Item label="入仓日期">
              {getFieldDecorator('ArrivalDate', {
                rules: [{ required: true, message: '请选择入仓日期' }],
              })(<DatePicker format="YYYY-MM-DD" />)}
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  };

  isDsdas = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <div>
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
              {getFieldDecorator('IsTake', {
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
              {getFieldDecorator('CustomerRemark')(
                <Input.TextArea placeholder="请输入备注" />
              )}
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  };

  isDsdasa = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;

    return (
      <div>
        <Row>
          <Col md={4} sm={24}>
            <h2 style={{ fontWeight: 'bold' }}>单号：ASD0002</h2>
          </Col>
          <Col md={3} sm={24}>
            <h2 style={{ fontWeight: 'bold' }}>状态：已下单</h2>
          </Col>
          <Col md={3} sm={24}>
            <Row><span>2019-03-28 13:34:56</span></Row>
            <Row>已下单</Row>
          </Col>
          <Col md={4} sm={24} style={{ paddingTop: 6 }}>
            <a href="javascript:;">详细运踪</a>
          </Col>
        </Row>
        <Row style={{ marginLeft: 20, marginTop: 20 }}>
          <Col md={5} sm={24}>
            <span style={{ color: 'black' }}>上门提货：</span>
            <span>{'否'}</span>
          </Col>
          <Col md={6} sm={24}>
            <span style={{ color: 'black' }}>仓库地址： </span>
            <span>{'XXX地址'}</span>
          </Col>
        </Row>
        <Row style={{ marginLeft: 20, marginTop: 20 }}>
          <Col md={5} sm={24}>
            <span style={{ color: 'black' }}>派送仓库： </span>
            <span>{'XXX仓库'}</span>
          </Col>
          <Col md={6} sm={24}>
            <span style={{ marginLeft: -14, color: 'black' }}>联系人电话：</span>
            <span>{'XXX123123'}</span>
          </Col>
          <Col md={6} sm={24}>
            <span style={{ color: 'black' }}>入仓日期：</span>
            <span>{'2019-03-27'}</span>
          </Col>
        </Row>

      </div>
    );
  };

  isDsdasb = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;

    return (
      <div>
        <Row>
          <Col md={4} sm={24}>
            <h2 style={{ fontWeight: 'bold' }}>单号：ASD0002</h2>
          </Col>
          <Col md={3} sm={24}>
            <h2 style={{ fontWeight: 'bold' }}>状态：已入仓</h2>
          </Col>
          <Col md={3} sm={24}>
            <Row><span>2019-03-28 13:34:56</span></Row>
            <Row>已下单</Row>
          </Col>
          <Col md={4} sm={24} style={{ paddingTop: 6 }}>
            <a href="javascript:;">详细运踪</a>
          </Col>
        </Row>
        <Row style={{ marginLeft: 20, marginTop: 20 }}>
          <Col md={5} sm={24}>
            <span style={{ color: 'black' }}>上门提货：</span>
            <span>{'否'}</span>
          </Col>
        </Row>
        <Row style={{ marginLeft: 20, marginTop: 20 }}>
          <Col md={5} sm={24}>
            <span style={{ color: 'black' }}>派送仓库： </span>
            <span>{'XXX仓库'}</span>
          </Col>
        </Row>
      </div>
    );
  };

  columns = [
    {
      title: '发货编号',
      dataIndex: 'ShipCode',
      key: 'ShipCode',
    },
    {
      title: '箱数*',
      dataIndex: 'BoxNum',
      key: 'BoxNum',

    },
    {
      title: '中文品名*',
      dataIndex: 'CnName',
      key: 'CnName',

    },
    {
      title: '英文品名*',
      dataIndex: 'EnName',
      key: 'EnName',

    },
    {
      title: '产品HS CODE*',
      dataIndex: 'HSCode',
      key: 'HSCode',

    },
    {
      title: '单箱重量(KG)*',
      dataIndex: 'BoxWeight',
      key: 'BoxWeight',

    },
    {
      title: '货箱长度(CM)*',
      dataIndex: 'BoxLong',
      key: 'BoxLong',

    },
    {
      title: '货箱宽度(CM)*',
      dataIndex: 'BoxWide',
      key: 'BoxWide',

    },
    {
      title: '货箱高度(CM)*',
      dataIndex: 'BoxHigh',
      key: 'BoxHigh',

    },
    {
      title: '体积',
      dataIndex: 'tiji',
      key: 'tiji',

    },
  ];

  footer = () =>
    `箱数：${''}  毛重：${''}  体积：${''}  计费重：${''}  总费用：${''}`;

  isTable1 = () => {
    return (<div>
      <Table
        columns={this.columns}
        dataSource={tableData}
        pagination={false}
        footer={this.footer}
      />
    </div>)
  }

  isTable2 = () => {
    return (<div>
      <h3>仓库信息</h3>
      <Table
        columns={this.columns}
        dataSource={tableData}
        pagination={false}
        footer={this.footer}
      />
    </div>)
  }

  isTable3 = () => {
    return (<div>
      {this.isTable1()}
      {this.isTable2()}
    </div>)
  }

  // 根据状态值显示不同内容
  playTrainOutStatus = () => {
    const { TrainOutStatus } = this.state;
    const {
      match: { params }
    } = this.props;
    if (Object.keys(params).length === 0) {
      return this.isDsdas();
    }
    switch (TrainOutStatus) {
      case 1:
        return this.isDsdasa();
      case 2:
        return this.isDsdasb();
      default:
        break;
    }
  }

  render() {
    const {
      form: { getFieldDecorator },
      submitting,
      match: { params },
      order_details: { pickupAddressData },
      dispatch
    } = this.props;
    const { width, modalVisible, type, TrainOutStatus } = this.state;
    
    const Methods = {
      handleModalVisible: this.handleModalVisible,
      modalVisible: modalVisible,
      modalClike: this.modalClike,
      data: pickupAddressData,

      dispatch: dispatch
    };
    return (
      <PageHeaderWrapper title="新建订单" wrapperClassName={styles.advancedForm}>
      
        <Form layout="inline" className={styles.advancedForm}>

          <Tabs
            type={type}
            hideAdd={false}
            onChange={this.onChange}
            onEdit={this.onEditTabs}
            className={styles.tabslist}
          >
            {this.state.panes.map((pane, ix) => (
              <TabPane forceRender tab={pane.title} key={pane.key} closable={pane.closable}>
                {pane.content}
              </TabPane>
            ))}
          </Tabs>
        </Form>

        <FooterToolbar style={{ width }}>
          {this.getErrorInfo()}
          <Button type="primary" onClick={this.validate} >
            保存
          </Button>
          <Button type="primary" loading={submitting}>
            提交
          </Button>
        </FooterToolbar>
        <ModalAddress {...Methods} />
      </PageHeaderWrapper>
    );
  }
}
export default OrderDetails;

