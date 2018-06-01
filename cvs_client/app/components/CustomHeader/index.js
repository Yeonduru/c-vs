import React from 'react';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Button from 'grommet/components/Button';
import User from 'grommet/components/icons/base/User';
import { withRouter } from 'react-router';


class CustomHeader extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <Header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0px 15px'}}>
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <Title onClick={() => this.props.router.push('/')}>C:VS</Title>
          <Button plain={true} label='제품' href='productAll'/>
          <Button plain={true} label='레시피' href='recipeAll'/>
        </div>
        <div>
          <Button plain={true} icon={<User size='small'/>} label='로그인' href='login'/>
        </div>
      </Header>
    );
  }
}

export default withRouter(CustomHeader);
