import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';
import * as USERTYPE from '../../constants/usertype';
import * as BRANCH from '../../constants/branches';

const SignUpPage = () => (
  <div>
    <h1>Register New User</h1>
    <SignUpForm />
  </div>
);

const INITIAL_STATE = {
  username: '',
  email: '',
  passwordOne: '',
  passwordTwo: '',
  isAdmin: false,
  error: null,
  userType: {},
  branchLocation: {},

};

const ERROR_CODE_ACCOUNT_EXISTS = 'auth/email-already-in-use';

const ERROR_MSG_ACCOUNT_EXISTS = `
  An account with this E-Mail address already exists.
  Try to login with this account instead. If you think the
  account is already used from one of the social logins, try
  to sign in with one of them. Afterward, associate your accounts
  on your personal account page.
`;

class SignUpFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { username, email, passwordOne, isAdmin, userType, branchLocation } = this.state;
    const roles = {};

    if (isAdmin) {
      roles[ROLES.ADMIN] = ROLES.ADMIN;
    } else {
      roles[ROLES.NOTADMIN] = ROLES.NOTADMIN;
    }

    this.props.firebase
      .doCreateUserWithEmailAndPassword(email, passwordOne)
      .then(authUser => {
        // Create a user in your Firebase realtime database
        return this.props.firebase.user(authUser.user.uid).set(
          {
            username,
            email,
            roles,
            userType,
            branchLocation,
          },
          { merge: true },
        );
      })
      // .then(() => {
      //   return this.props.firebase.doSendEmailVerification();
      // })
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.BULLETIN_BOARD);
      })
      .catch(error => {
        if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
          error.message = ERROR_MSG_ACCOUNT_EXISTS;
        }

        this.setState({ error });
      });

    event.preventDefault();
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onChangeDropdown = event => {
    this.setState({ [event.target.name]: {[event.target.value] : event.target.value}});
  };

  onChangeCheckbox = event => {
    this.setState({ [event.target.name]: event.target.checked });
  };

  render() {
    const {
      username,
      email,
      passwordOne,
      passwordTwo,
      isAdmin,
      error,
    } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === '' ||
      email === '' ||
      username === '';

    return (
      <form onSubmit={this.onSubmit}>
        <input
          name="username"
          value={username}
          onChange={this.onChange}
          type="text"
          placeholder="Username"
        />
        <br/>
        <input
          name="email"
          value={email}
          onChange={this.onChange}
          type="text"
          placeholder="Email Address"
        />
        <br/>
        <input
          name="passwordOne"
          value={passwordOne}
          onChange={this.onChange}
          type="password"
          placeholder="Password"
        />
        <br/>
        <input
          name="passwordTwo"
          value={passwordTwo}
          onChange={this.onChange}
          type="password"
          placeholder="Confirm Password"
        />
        <br/><br/>
        <label>
          User Type:
          <select
            name="userType"
            onChange={this.onChangeDropdown}>
            <option value={USERTYPE.BAKER}>{USERTYPE.BAKER}</option>
            <option value={USERTYPE.SPOTTER}>{USERTYPE.SPOTTER}</option>
            <option value={USERTYPE.WAREHOUSE}>{USERTYPE.WAREHOUSE}</option>
            <option value={USERTYPE.BRANCH_MGR}>{USERTYPE.BRANCH_MGR}</option>
            <option value={USERTYPE.DISTRICT_MGR}>{USERTYPE.DISTRICT_MGR}</option>
            <option value={USERTYPE.ACCOUNTING}>{USERTYPE.ACCOUNTING}</option>
            <option value={USERTYPE.OWNER}>{USERTYPE.OWNER}</option>
          </select>
        </label>
        <br/><br/>
        <label>
          Branch:
          <select
            name="branchLocation"
            onChange={this.onChangeDropdown}>
            <option value ={BRANCH.BRANCH_BUTUAN_PALENGKE}>{BRANCH.BRANCH_BUTUAN_PALENGKE}</option>
            <option value ={BRANCH.BRANCH_BUTUAN_ROBINSONS}>{BRANCH.BRANCH_BUTUAN_ROBINSONS}</option>
            <option value ={BRANCH.BRANCH_BUTUAN_ESTACIO}>{BRANCH.BRANCH_BUTUAN_ESTACIO}</option>
            <option value ={BRANCH.BRANCH_CAGAYAN_GAISANO}>{BRANCH.BRANCH_CAGAYAN_GAISANO}</option>
            <option value ={BRANCH.BRANCH_DAVAO_SM_LANANG}>{BRANCH.BRANCH_DAVAO_SM_LANANG}</option>
            <option value ={BRANCH.BRANCH_DUBAI_BURJ_KHALIFA}>{BRANCH.BRANCH_DUBAI_BURJ_KHALIFA}</option>
          </select>
        </label>
        <br/>
        <br/>
        <label>
          Give {[ROLES.ADMIN]} Access?
          <input
            name="isAdmin"
            type="checkbox"
            checked={isAdmin}
            onChange={this.onChangeCheckbox}
          />
        </label>
        <br/><br/>
        <button disabled={isInvalid} type="submit">
          Sign Up
        </button>

        {error && <p>{error.message}</p>}
      </form>
    );
  }
}

const SignUpLink = () => (
  <p>
    Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
  </p>
);

const SignUpForm = withRouter(withFirebase(SignUpFormBase));

export default SignUpPage;

export { SignUpForm, SignUpLink };
