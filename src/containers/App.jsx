import React, { Component } from 'react'
import { cozyConnect } from 'redux-cozy-client'
import { Route, Switch, Redirect, withRouter } from 'react-router-dom'

import Sidebar from '../components/Sidebar'
import Notifier from '../components/Notifier'

import Loading from '../components/Loading'
import Failure from '../components/Failure'
import ConnectionsQueue from '../ducks/connections/components/queue/index'

import { initializeRegistry } from '../ducks/registry'
import { fetchAccounts } from '../ducks/accounts'
import { fetchKonnectorJobs } from '../ducks/jobs'
import { fetchKonnectors } from '../ducks/konnectors'
import { fetchTriggers } from '../ducks/triggers'

import CategoryList from '../components/CategoryList'
import ConnectedList from '../components/ConnectedList'

class App extends Component {
  constructor(props, context) {
    super(props, context)
    this.store = this.context.store

    props.initializeRegistry(props.initKonnectors)
  }

  render() {
    const { accounts, konnectors, triggers } = this.props
    const isFetching = [accounts, konnectors, triggers].find(collection =>
      ['pending', 'loading'].includes(collection.fetchStatus)
    )

    const hasError = [accounts, konnectors, triggers].find(
      collection => collection.fetchStatus === 'failed'
    )

    if (hasError) {
      return (
        <div className="col-initial-error">
          <Failure errorType="initial" />
        </div>
      )
    }
    return isFetching ? (
      <div className="col-initial-loading">
        <Loading loadingType="initial" />
      </div>
    ) : (
      <div className="col-wrapper coz-sticky">
        <Sidebar categories={this.store.categories} />
        <main className="col-content">
          <div
            role="contentinfo"
            ref={div => {
              this.contentWrapper = div
            }}
          >
            <Switch>
              <Route
                path="/connected"
                component={props => (
                  <ConnectedList
                    {...props}
                    base="/connected"
                    wrapper={this.contentWrapper}
                  />
                )}
              />
              <Route
                path="/providers/:filter"
                render={props => (
                  <CategoryList
                    {...props}
                    categories={this.store.categories}
                    wrapper={this.contentWrapper}
                  />
                )}
              />
              <Redirect exact from="/providers" to="/providers/all" />
              <Redirect exact from="/" to="/connected" />
              <Redirect from="*" to="/connected" />
            </Switch>
          </div>
        </main>
        <Notifier />
        <ConnectionsQueue />
      </div>
    )
  }
}

const mapActionsToProps = dispatch => ({
  initializeRegistry: konnectors => dispatch(initializeRegistry(konnectors))
})

const mapDocumentsToProps = (state, ownProps) => ({
  accounts: fetchAccounts(),
  jobs: fetchKonnectorJobs(),
  konnectors: fetchKonnectors(),
  triggers: fetchTriggers()
  // TODO: fetch registry
  // registry: fetchRegistry()
})

/*
withRouter is necessary here to deal with redux
https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/guides/blocked-updates.md
*/
export default withRouter(
  cozyConnect(mapDocumentsToProps, mapActionsToProps)(App)
)
