import React, { PureComponent } from 'react';
import {
  Select,
  Card,
  Form,
  Col,
  Row,
  Input,
  Radio
} from 'antd';
import { connect } from 'dva';
import styles from './OrderDetails.less';
var timeoutHandler;

// @connect(({  }) => ({

// }))
@Form.create()
class TabPanesForm extends PureComponent {
  state = {
    display_cang: '1',
  };


  onSubmit = () => {

    const { form } = this.props;
    form.validateFieldsAndScroll((error, values) => {
      
    })
  }

  
  
  render() {
    const {
      tabform: { getFieldDecorator, validateFieldsAndScroll },
      index, 
      dispatch
    } = this.props;
    debugger
    return (
      <div>
        <Card title="任务管理" className={styles.card} bordered={false}>
          <Row style={{ marginLeft: 40, marginRight: 40 }} gutter={{ md: 8, lg: 24, xl: 48 }} >
            <Col md={8} sm={24}>
              <Form.Item label="收件人">
                {getFieldDecorator('收件人' + index, {
                  rules: [
                    {
                      required: true,
                      message: `收件人不能为空.`,
                    },
                  ],
                })(
                  
                    <Input placeholder="请输入"></Input>
                )}
              </Form.Item>
            </Col>
            <Col md={8} sm={24}>
              
            </Col>
            <Col md={8} sm={24}>
              
            </Col>
          </Row>
          <Row style={{ marginLeft: 40, marginRight: 40 }} gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col md={8} sm={24}>
          
            </Col>
            <Col md={8} sm={24}>
              <Form.Item label="邮编">
                {getFieldDecorator('ZipCode' + index, {
                  rules: [
                    {
                      required: true,
                      message: `邮编不能为空.`,
                    },
                  ],
                })(<Input placeholder="请输入" /> )}
              </Form.Item>
            </Col>
            <Col md={8} sm={24}>
              <Form.Item label="详细地址">
                {getFieldDecorator('ConsignneAddress' + index, {
                  rules: [
                    {
                      required: true,
                      message: `详细地址不能为空.`,
                    },
                  ],
                })(<Input placeholder="请输入" /> )}
              </Form.Item>
            </Col>
          </Row>
         
           
          {/* {this.state.display_cang === '1' ? this.isFBA() : this.state.display_cang === '2' ? this.isHaiWai() : this.state.display_cang === '3' ? this.isQiTa() : this.isZOTY()} */}
        </Card>
         
      </div>
    );
  }
}
export default TabPanesForm;
