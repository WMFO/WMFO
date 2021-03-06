import * as React from "react";
import Maybe from "../ts/maybe";
import { PERMISSION_LEVEL_STRINGS, PermissionLevel, AuthState, CommunityMemberRecord } from "../ts/authState";
import Component from "./Component";
import { FormComponent, ErrorState } from "./Form";
import WMFORequest from "../ts/request";
import { browserHistory } from "react-router";
import { Message } from "./Message";
import WMFOStyles from "../ts/styles";

interface AddUsersState {
    signedIn: boolean;
    addSingle: Maybe<boolean>;
}

interface AddSingleUserFormState {
    djEmail: string;
    isStudentDj: boolean;
    isCommunityDj: boolean;
    isGM: boolean;
    isAGM: boolean;
    isOD: boolean;
    isPD: boolean;
    isSC: boolean;
    isVC: boolean;
    isWebMaster: boolean;
    djConflict: boolean;
    noPermissions: boolean;
    hasSubmitted: boolean;
    error: boolean;
    message: string;
}

const ADD_USERS_URL: string = '/api/exec/addPendingMembers';

class AddSingleUserForm extends FormComponent<{}, AddSingleUserFormState> {
    constructor(props: any) {
        super(props);
        this.state = {
            djEmail: '',
            isStudentDj: false,
            isCommunityDj: false,
            isGM: false,
            isAGM: false,
            isOD: false,
            isPD: false,
            isSC: false,
            isVC: false,
            isWebMaster: false,
            djConflict: false,
            noPermissions: false,
            hasSubmitted: false,
            error: false,
            message: ''
        };
    }

    private readonly errorStates: ErrorState<AddSingleUserFormState>[] = [{
        field: 'djConflict',
        condition: (state: AddSingleUserFormState) => state.isStudentDj && state.isCommunityDj
    }, {
        field: 'noPermissions',
        condition: (state: AddSingleUserFormState) => !(state.isStudentDj  ||
            state.isCommunityDj ||
            state.isGM ||
            state.isAGM ||
            state.isOD ||
            state.isPD ||
            state.isSC ||
            state.isVC ||
            state.isWebMaster)
    }];

    private buildPermissionArray(): PermissionLevel[] {
        const permissions: PermissionLevel[] = [];
        if (this.state.isStudentDj) permissions.push('STUDENT_DJ');
        if (this.state.isCommunityDj) permissions.push('COMMUNITY_DJ');
        if (this.state.isGM) permissions.push('GENERAL_MANAGER');
        if (this.state.isAGM) permissions.push('ASSISTANT_GENERAL_MANAGER');
        if (this.state.isOD) permissions.push('OPERATIONS_DIRECTOR');
        if (this.state.isPD) permissions.push('PROGRAMMING_DIRECTOR');
        if (this.state.isSC) permissions.push('SCHEDULING_COORDINATOR');
        if (this.state.isVC) permissions.push('VOLUNTEER_COORDINATOR');
        if (this.state.isWebMaster) permissions.push('WEBMASTER');

        return permissions;
    }

    async handleSubmit(event: any) {
        event.preventDefault();
        if (await this.errorCheck(this.state, this.errorStates)) {
            console.log('error:', this.state);
            return;
        }
        await this.updateStateAsync('hasSubmitted', true);
        try {
            const response = await WMFORequest.getInstance().POST(ADD_USERS_URL, {
                pendingMembers: [{
                    email: this.state.djEmail,
                    permissionLevels: this.buildPermissionArray()
                }]
            });
            await this.updateStateAsync('error', false);
            await this.updateStateAsync('message', `Successfully added user ${this.state.djEmail}! They should receive an email soon.  If not, send them their unique URL from the Pending Members tab.`);
            this.setState({
                djEmail: '',
                isStudentDj: false,
                isCommunityDj: false,
                isGM: false,
                isAGM: false,
                isOD: false,
                isPD: false,
                isSC: false,
                isVC: false,
                isWebMaster: false,
                djConflict: false,
                noPermissions: false,
                hasSubmitted: true,
                error: false,
                message: this.state.message
            });
        } catch (e) {
            console.log(e);
            console.log('error response:', e.status);
            await this.updateStateAsync('error', true);
            await this.updateStateAsync('message', 'An error occurred! Please make sure that the email is spelled correctly. If this keeps happening, contact the webmaster for help.');
        }
    }

    render() {
        return (
            <form style={WMFOStyles.FORM_STYLE} onSubmit={this.handleSubmit.bind(this)}>
            <p style={{ color: '#333', textAlign: 'center' }}>Adding one user</p>
                <label htmlFor="djEmail">New User Email</label>
                <input type="email" value={this.state.djEmail} id="djEmail" onChange={this.handleChange.bind(this)}/>
                <br/>
                <label htmlFor="isStudentDj">Student DJ</label>
                <input key={this.state.isStudentDj ? 0 : 1} name="isStudentDj" type="checkbox" id="isStudentDj" onChange={this.handleChange.bind(this)} checked={this.state.isStudentDj}/>
                <br/>

                <label htmlFor="isCommunityDj">Community DJ</label>
                <input key={this.state.isCommunityDj ? 2 : 3} name="isCommunityDj" type="checkbox" id="isCommunityDj" onChange={this.handleChange.bind(this)} checked={this.state.isCommunityDj}/>
                <br/>

                <label htmlFor="isGM">General Manager</label>
                <input key={this.state.isGM ? 4 : 5} name="isGM" type="checkbox" id="isGM" onChange={this.handleChange.bind(this)} checked={this.state.isGM}/>
                <br/>

                <label htmlFor="isAGM">Assistant GM</label>
                <input key={this.state.isAGM ? 6 : 7} name="isAGM" type="checkbox" id="isAGM" onChange={this.handleChange.bind(this)} checked={this.state.isAGM}/>
                <br/>

                <label htmlFor="isOD">Operations Director</label>
                <input key={this.state.isOD ? 8 : 9} name="isOD" type="checkbox" id="isOD" onChange={this.handleChange.bind(this)} checked={this.state.isOD}/>
                <br/>

                <label htmlFor="isPD">Programming Director</label>
                <input key={this.state.isPD ? 10 : 11} name="isPD" type="checkbox" id="isPD" onChange={this.handleChange.bind(this)} checked={this.state.isPD}/>
                <br/>

                <label htmlFor="isSC">Scheduling Coordinator</label>
                <input key={this.state.isSC ? 12 : 13} name="isSC" type="checkbox" id="isSC" onChange={this.handleChange.bind(this)} checked={this.state.isSC}/>
                <br/>

                <label htmlFor="isVC">Volunteer Coordinator</label>
                <input key={this.state.isVC ? 14 : 15} name="isVC" type="checkbox" id="isVC" onChange={this.handleChange.bind(this)} checked={this.state.isVC}/>
                <br/>

                <label htmlFor="isWebMaster">WebMaster</label>
                <input key={this.state.isWebMaster ? 16 : 17} name="isWebMaster" type="checkbox" id="isWebMaster" onChange={this.handleChange.bind(this)} checked={this.state.isWebMaster}/>
                <br/>

                <p style={{ padding: '5%', display: this.state.noPermissions ? 'block' : 'none' }}>
                    Must select at least one permission level.
                </p>
                <input type="submit" value="Submit"/>
                <p style={{
                    display: this.state.hasSubmitted ? 'block' : 'none'
                }}>{this.state.message}</p>
            </form>
        );
    }
}

interface AddMultipleUserFormState {
    communityDJs: string;
    communityDJsError: boolean;
    studentDJs: string;
    studentDJsError: boolean;
    bothBlank: boolean;
    hasSubmitted: boolean;
    submitError: boolean;
};

class AddMultipleUserForm extends FormComponent<{}, AddMultipleUserFormState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            communityDJs: '',
            communityDJsError: false,
            studentDJs: '',
            studentDJsError: false,
            bothBlank: false,
            hasSubmitted: false,
            submitError: false,
        };
    }

    private readonly EMAIL_LIST_REGEX: RegExp = /^\s*([\w+-.%]+@[\w-.]+\.[A-Za-z]+,*[\W]*)+\s*$/;

    private readonly errorStates: ErrorState<AddMultipleUserFormState>[] = [{
        field: 'communityDJsError',
        condition: (state: AddMultipleUserFormState) => state.communityDJs.length > 0 && !this.EMAIL_LIST_REGEX.test(state.communityDJs)
    }, {
        field: 'studentDJsError',
        condition: (state: AddMultipleUserFormState) => state.studentDJs.length > 0 && !this.EMAIL_LIST_REGEX.test(state.studentDJs)
    }, {
        field: 'bothBlank',
        condition: (state: AddMultipleUserFormState) => state.studentDJs.length === 0 && state.communityDJs.length === 0
    }];

    async handleSubmit(event: any) {
        event.preventDefault();
        if (await this.errorCheck(this.state, this.errorStates)) {
            return;
        }
        await this.updateStateAsync('hasSubmitted', true);
        const getEmails = (textareaValue: string) => textareaValue
            .split(',')
            .filter(s => s.length > 0 && /\S/.test(s))
            .map(s => s.trim());

        // check for duplicates
        const studentDJEmails = getEmails(this.state.studentDJs);
        const communityDJEmails = getEmails(this.state.communityDJs);

        function findDuplicate(emails: string[]): string {
            const seenEmails: { [email: string]: boolean } = {};
            const duplicate = emails.reduce((acc: string, email: string) => {
                if (acc != null) return acc;
                if (seenEmails[email] != null) return email;
                seenEmails[email] = true;
                return acc;
            }, null);
            return duplicate;
        };

        const duplicateStudentEmail = findDuplicate(studentDJEmails);
        if (duplicateStudentEmail != null) {
            alert(`Duplicate student DJ email: ${duplicateStudentEmail}`);
            return;
        }

        const duplicateCommunityEmail = findDuplicate(communityDJEmails);
        if (duplicateCommunityEmail != null) {
            alert(`Duplicate community DJ email: ${duplicateCommunityEmail}`);
            return;
        }

        const allEmails = studentDJEmails.concat(communityDJEmails);
        const duplicateEmail = findDuplicate(allEmails);
        if (duplicateEmail != null) {
            alert(`Email ${duplicateEmail} entered in both lists`);
            return;
        }

        const pendingMembers: { email: string, permissionLevels: PermissionLevel[] }[] = [];
        studentDJEmails.forEach((email: string) =>
            pendingMembers.push({
                email: email,
                permissionLevels: ['STUDENT_DJ']
            }));
        communityDJEmails.forEach((email: string) =>
            pendingMembers.push({
                email: email,
                permissionLevels: ['COMMUNITY_DJ']
            }));

        try {
            const response = await WMFORequest.getInstance().POST(ADD_USERS_URL, {
                pendingMembers: pendingMembers
            });
            await this.updateStateAsync('submitError', false);
            await this.setStateAsync({
                communityDJs: '',
                communityDJsError: false,
                studentDJs: '',
                studentDJsError: false,
                bothBlank: false,
                hasSubmitted: true,
                submitError: false,
            });
        } catch (e) {
            console.log('err', e)
            await this.updateStateAsync('submitError', true);
        }
        await this.updateStateAsync('hasSubmitted', true);
    }

    render() {
        const sentMessage = this.state.submitError ?
            'An error occurred while submitting. Make sure none of the emails you entered are already users.  If the error keeps occurring, contact the webmaster.' :
            'Successfully submitted! All new users will soon receive an email with their unique URL.  If the email does not send, go to the \'Pending Members\' tab to find their unique URL and send it to them manually.';
        return (
            <form style={WMFOStyles.FORM_STYLE} onSubmit={this.handleSubmit.bind(this)}>
                <p style={{color: '#333', textAlign: 'center' }}>Fill out at least one of the boxes below to add multiple users.</p>
                <p style={{color: '#333', textAlign: 'center' }}>Enter comma-separated lists of email addresses</p>
                <label>Student DJs (batch entry)</label>
                <br/>
                <textarea style={{display: 'block', height: '50px'}} id="studentDJs" value={this.state.studentDJs} onChange={this.handleChange.bind(this)}/>
                <Message showCondition={this.state.studentDJsError} message="Must be comma-separated email addresses" style={{color: 'red'}}/>
                <br/>

                <label>Community DJs (batch entry)</label>
                <br/>
                <textarea style={{display: 'block', height: '50px'}} id="communityDJs" value={this.state.communityDJs} onChange={this.handleChange.bind(this)}/>
                <Message showCondition={this.state.communityDJsError} message="Must be comma-separated email addresses" style={{color: 'red'}}/>
                <br/>
                <Message showCondition={this.state.bothBlank} message="Cannot have both fields blank" style={{color: 'red'}}/>
                <Message showCondition={this.state.hasSubmitted} message={sentMessage} style={{}}/>
                <input type="submit" value="Submit"/>
            </form>
        );
    }
}

export class AddUsers extends Component<{}, AddUsersState> {
    private static addedListener: boolean = false;
    constructor(props: any) {
        super(props);
        this.state = {
            signedIn: AuthState.getInstance().getState().isJust(),
            addSingle: Maybe.nothing<boolean>(),
        };

        if (!AddUsers.addedListener) {
            AuthState.getInstance().addListener((m: Maybe<CommunityMemberRecord>) => this.updateState('signedIn', m.isJust()));
            AddUsers.addedListener = true;
        }
    }

    async componentDidMount() {
        await AuthState.getInstance().updateState();
        this.updateState('signedIn', AuthState.getInstance().getState().isJust());
    }

    changeForm(addSingle: boolean) {
        this.updateState('addSingle', Maybe.just<boolean>(addSingle));
    }

    render() {
        if (!this.state.signedIn) return null;

        const content = this.state.addSingle.caseOf({
            nothing: () => null,
            just: (addSingle: boolean) => addSingle ? <AddSingleUserForm/> : <AddMultipleUserForm/>
        });
        return (
            <div>
                <ul style={{
                    marginTop: '5%',
                    marginBottom: '2%',
                }}>
                    <li><a href="javascript:void(0);" onClick={(event) => this.changeForm.bind(this)(true)}>Add Single User</a></li>
                    <li><a href="javascript:void(0);" onClick={(event) => this.changeForm.bind(this)(false)}>Add Many Users</a></li>
                </ul>
                {content}
            </div>
        );
    }
}
