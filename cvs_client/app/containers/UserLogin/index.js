/*
 *
 * UserLogin
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { signupRequest, signupResult } from './actions'
import { loginRequest } from '../App/actions'
import Grommet from 'grommet'
import Box from 'grommet/components/Box';
import Anchor from 'grommet/components/Anchor'
import Form from 'grommet/components/Form'
import FormField from 'grommet/components/FormField'
import TextInput from 'grommet/components/TextInput'
import Status from 'grommet/components/icons/Status'
import Heading from 'grommet/components/Heading'
import Layer from 'grommet/components/Layer'
import Toast from 'grommet/components/Toast'


function validateEmail(email) {
  let emailExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailExp.test(String(email).toLowerCase());
}

function validatePassword(password) {
  let passwordExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
  return passwordExp.test(String(password))
}

function validateUsername(username) {
  let usernameExp = /^[A-Za-z]{1}[A-Za-z0-9_]{3,19}$/
  return usernameExp.test(String(username))
}

export class UserLogin extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super()
    this.state = {
      needSignUp: false,
      usernameValid: false,
      emailValid: false,
      passwordValid: false,
      passwordConfirm: false,
    }
  }
  componentWillReceiveProps (nextProps) {
    if(nextProps.signupSucceeded){
      this.setState({needSignUp: false, usernameValid: false, emailValid: false, passwordValid: false, passwordConfirm: false})
      this.props.signupResult(false, )
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if(!this.props.loginResult)
      if(nextProps.loginResult){
        this.props.router.push('/')
      }
  }

  render() {
    return (
      <div>
        <Box align='center' pad='large'>
          <Grommet.LoginForm align='center' title='C:VS login' onSubmit={(data) => {
            this.props.loginRequest(data.username, data.password)
          }} usernameType='text'/>
          <Anchor label='회원이 아니신가요?' onClick={() => this.setState({needSignUp: true})}/>
          {
            this.state.needSignUp && !this.props.signupSucceeded &&
            <Layer onClose={() => {
              this.setState({needSignUp: false, usernameValid: false, emailValid: false, passwordValid: false, passwordConfirm: false})
              this.props.signupResult(false, )
            }} closer={true}>
              <div style={{margin: '50px'}}>
                {
                  (this.props.errorMessage) &&
                  <Toast status='critical'
                         onClose={() => {
                           this.props.signupResult(false, )
                         }}>
                    {this.props.errorMessage}
                  </Toast>
                }
                <Heading tag='h2'>회원 가입</Heading>
                <Form>
                  <FormField label='Username (첫글자 영문. 영문/숫자 4자리 이상 20자리 이하)'>
                    <div>
                      <TextInput
                        id='username'
                        style={{border: '0px', width: '90%', paddingRight: '25px'}}
                        onDOMChange={(event) => {
                          this.setState({usernameValid: validateUsername(event.target.value)})
                        }}
                      />
                      <Status value={this.state.usernameValid ? 'ok' : 'critical'}/>
                    </div>
                  </FormField>
                  <FormField label='Password (영문, 숫자 포함 8자리 이상)'>
                    <div>
                      <TextInput
                        id='password-input'
                        style={{border: '0px', width: '90%', paddingRight: '25px'}}
                        type='password'
                        onDOMChange={(event) => {
                          this.setState({passwordValid: validatePassword(event.target.value), passwordConfirm: event.target.value === '' ? false : event.target.value === document.getElementById('password-confirm').value})
                        }}
                      />
                      <Status value={this.state.passwordValid ? 'ok' : 'critical'}/>
                    </div>
                  </FormField>
                  <FormField label='Password Confirm'>
                    <div>
                      <TextInput
                        id='password-confirm'
                        style={{border: '0px', width: '90%', paddingRight: '25px'}}
                        type='password'
                        onDOMChange={(event) => {
                          this.setState({passwordConfirm: event.target.value === '' ? false : event.target.value === document.getElementById('password-input').value})
                        }}
                      />
                      <Status value={this.state.passwordConfirm ? 'ok' : 'critical'}/>
                    </div>
                  </FormField>
                  <FormField label='E-mail'>
                    <div>
                      <TextInput
                        id='e-mail'
                        style={{border: '0px', width: '90%', paddingRight: '25px'}}
                        onDOMChange={(event) => {
                          this.setState({emailValid: validateEmail(event.target.value)})
                        }}
                      />
                      <Status value={this.state.emailValid ? 'ok' : 'critical'}/>
                    </div>
                  </FormField>
                </Form>
                <div style={{margin: '10px 0 0 0', justifyContent: 'flex-end', display: 'flex'}}>
                  <Anchor
                    primary={true}
                    reverse={true}
                    onClick={() => {
                      if (this.state.passwordValid && this.state.usernameValid && this.state.passwordConfirm && this.state.emailValid) {
                        this.props.signupRequest(document.getElementById('username').value, document.getElementById('password-input').value, document.getElementById('e-mail').value)
                      }
                    }}
                    disabled={!(this.state.passwordValid && this.state.usernameValid && this.state.passwordConfirm && this.state.emailValid)}
                    label='회원 가입'
                    style={{padding: '5px'}}/>
                </div>
              </div>
            </Layer>
          }
        </Box>
      </div>
    );
  }
}

UserLogin.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return ({
    errorMessage: state.get('userLogin').toJS().errorMessage,
    signupSucceeded: state.get('userLogin').toJS().signupSucceeded,
    loginResult: state.get('global').toJS().loginResult,
  })}

function mapDispatchToProps(dispatch) {
  return {
    signupRequest: (username, password, email) => dispatch(signupRequest(username, password, email)),
    signupResult: (succeeded, message) => dispatch(signupResult(succeeded, message)),
    loginRequest: (username, password) => dispatch(loginRequest(username, password))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserLogin);
