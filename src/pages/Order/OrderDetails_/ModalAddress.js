import React, { PureComponent } from 'react';
import { Table, Button, Input, message, Popconfirm, Divider, Modal } from 'antd';
import isEqual from 'lodash/isEqual';
import styles from './OrderDetails.less';

export default class ModalAddress extends PureComponent {
  index = 0;

  cacheOriginData = {};

  constructor(props) {
    super(props);

    this.state = {
      data: props.data,
      loading: false,
      /* eslint-disable-next-line react/no-unused-state */
      value: props.data,
    };
  }

  static getDerivedStateFromProps(nextProps, preState) {
    if (isEqual(nextProps.data, preState.value)) {
      return null;
    }
    return {
      data: nextProps.data,
      value: nextProps.data,
    };
  }

  getRowByKey(key, newData) {
    const { data } = this.state;
    return (newData || data).filter(item => item.Id === key)[0];
  }

  toggleEditable = (e, key) => {
    e.preventDefault();
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (target) {
      // 进入编辑状态时保存原始数据
      if (!target.editable) {
        this.cacheOriginData[key] = { ...target };
      }
      target.editable = !target.editable;
      this.setState({ data: newData });
    }
  };

  newMember = () => {
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));
    let t = [];
    var rowt;
    data.forEach(row => {
      t.push(parseInt(row.Id));
    });
    if (t.length === 0)
      rowt = 0;
    else
      rowt = Math.max.apply(null, t);
    newData.push({
      Id: rowt + 1,
      Addressee: '',
      Contact: '',
      Tel: '',
      editable: true,
      isNew: true,
    });
    this.index += 1;
    this.setState({ data: newData });
  };

  remove(key) {
    const { data } = this.state;
    const { dispatch } = this.props; 
    dispatch({
      type: 'order_details/deleteCustomerPickupAddress',
      payload: {
        Id: key,
      },
      callback: (scuu) => {
        if (scuu) {
          debugger
          const newData = data.filter(item => item.Id !== key);
          this.setState({ data: newData });
          this.getCustomerPickupAddress();
        }
      }
    });
  }

  getCustomerPickupAddress() { 
    const { dispatch } = this.props; 
    dispatch({
      type: 'order_details/getCustomerPickupAddress',
      payload: {
        Id: localStorage.getItem('OutsideCustomerId')
      }
    });
  }

  handleKeyPress(e, key) {
    if (e.key === 'Enter') {
      this.saveRow(e, key);
    }
  }



  handleFieldChange(e, fieldName, key) {
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.value;
      this.setState({ data: newData });
    }
  }

  saveRow(e, key) {
    e.persist();

    if (this.clickedCancel) {
      this.clickedCancel = false;
      return;
    }
    const target = this.getRowByKey(key) || {};
    if (!target.Addressee || !target.Contact || !target.Tel) {
      message.error('请填写完整的地址信息。');
      e.target.focus();
      return;
    }
    delete target.isNew;
    const { dispatch } = this.props;
    if (target.UserId === undefined) {
      dispatch({
        type: 'order_details/createCustomerPickupAddress',
        payload: {
          UserId: localStorage.getItem('UserId'),
          CustomerId: localStorage.getItem('OutsideCustomerId'),
          Addressee: target.Addressee,
          Contact: target.Contact,
          Tel: target.Tel,
        },
        callback: (scuu) => {
          if (scuu) {
            this.toggleEditable(e, key);
            this.getCustomerPickupAddress();
          }
        }
      });
    } else {
      dispatch({
        type: 'order_details/modifyCustomerPickupAddress',
        payload: {
          UserId: localStorage.getItem('UserId'),
          CustomerId: localStorage.getItem('OutsideCustomerId'),
          Addressee: target.Addressee,
          Contact: target.Contact,
          Tel: target.Tel,
          Id: target.Id,
        },
        callback: (scuu) => {
          if (scuu) {
            this.toggleEditable(e, key);
            this.getCustomerPickupAddress();
          }
        }
      });
    }

  }

  cancel(e, key) {
    this.clickedCancel = true;
    e.preventDefault();
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (this.cacheOriginData[key]) {
      Object.assign(target, this.cacheOriginData[key]);
      delete this.cacheOriginData[key];
    }
    target.editable = false;
    this.setState({ data: newData });
    this.clickedCancel = false;
  }
  okHandle = () => {
    modalClike(fieldsValue);
  };

  render() {
    const columns = [
      {
        title: '提货地址',
        dataIndex: 'Addressee',
        width: '30%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={text}
                autoFocus
                onChange={e => this.handleFieldChange(e, 'Addressee', record.Id)}
                onKeyPress={e => this.handleKeyPress(e, record.Id)}
                placeholder="提货地址"
              />
            );
          }
          return text;
        },
      },
      {
        title: '联系人',
        dataIndex: 'Contact',
        width: '20%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={text}
                onChange={e => this.handleFieldChange(e, 'Contact', record.Id)}
                onKeyPress={e => this.handleKeyPress(e, record.Id)}
                placeholder="联系人"
              />
            );
          }
          return text;
        },
      },
      {
        title: '电话',
        dataIndex: 'Tel',
        width: '30%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={text}
                onChange={e => this.handleFieldChange(e, 'Tel', record.Id)}
                onKeyPress={e => this.handleKeyPress(e, record.Id)}
                placeholder="电话"
              />
            );
          }
          return text;
        },
      },
      {
        title: '操作',
        render: (text, record) => {
          const { loading } = this.state;
          if (!!record.editable && loading) {
            return null;
          }
          if (record.editable) {
            if (record.isNew) {
              return (
                <span>
                  <a onClick={e => this.saveRow(e, record.Id)}>保存</a>
                  <Divider type="vertical" />
                  <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.Id)}>
                    <a>删除</a>
                  </Popconfirm>
                </span>
              );
            }
            return (
              <span>
                <a onClick={e => this.saveRow(e, record.Id)}>保存</a>
                <Divider type="vertical" />
                <a onClick={e => this.cancel(e, record.Id)}>取消</a>
              </span>
            );
          }
          return (
            <span>
              <a onClick={e => this.toggleEditable(e, record.Id)}>编辑</a>
              <Divider type="vertical" />
              <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.Id)}>
                <a>删除</a>
              </Popconfirm>
            </span>
          );
        },
      },
    ];
    const { loading, data } = this.state;
    const { modalVisible, handleModalVisible, modalClike } = this.props;

    return (
      <Modal
        width={900}
        destroyOnClose
        // centered
        visible={modalVisible}
        onOk={() => okHandle}
        onCancel={() => handleModalVisible()}
        footer={null}
      >
        <Table
          loading={loading}
          columns={columns}
          dataSource={data}
          rowKey={data => data.Id}
          pagination={false}
          rowClassName={record => (record.editable ? styles.editable : '')}
        />
        <Button
          style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
          type="dashed"
          onClick={this.newMember}
          icon="plus"
        >
          新增成员
        </Button>
      </Modal>
    );
  }
}
