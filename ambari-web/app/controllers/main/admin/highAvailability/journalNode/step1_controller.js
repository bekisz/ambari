/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var App = require('app');

require('controllers/wizard/step5_controller');

App.ManageJournalNodeWizardStep1Controller = Em.Controller.extend(App.BlueprintMixin, App.AssignMasterComponents, {

  name:"manageJournalNodeWizardStep1Controller",

  useServerValidation: false,

  mastersToShow: ['JOURNALNODE'],

  mastersToAdd: [],

  showInstalledMastersFirst: true,

  JOURNALNODES_COUNT_MINIMUM: 3, // TODO get this from stack

  /**
   * On initial rendering, load equivalent number of existing JournalNodes to masterToShow
   * @param masterComponents
   */
  renderComponents: function(masterComponents) {
    var jns = App.HostComponent.find().filterProperty('componentName', 'JOURNALNODE');
    var count = jns.get('length');
    this.set('mastersToAdd', []);
    if (masterComponents.filterProperty('component_name', 'JOURNALNODE').length == 0) {
      for (var i = 0; i < count; i++) {
        this.get('mastersToAdd').push('JOURNALNODE');
      }
    }
    this._super(masterComponents);
    this.updateJournalNodeInfo();
    this.showHideJournalNodesAddRemoveControl();
  },

  /**
   * Enable/Disable show/hide operation for each JournalNode
   */
  showHideJournalNodesAddRemoveControl: function() {
    var masterComponents = this.get('selectedServicesMasters');
    var jns = masterComponents.filterProperty('component_name', 'JOURNALNODE');
    var maxNumMasters = this.getMaxNumberOfMasters('JOURNALNODE')
    var showRemoveControl = jns.get('length') > this.get('JOURNALNODES_COUNT_MINIMUM');
    var showAddControl = jns.get('length') < maxNumMasters;
    jns.forEach(function(item) {
      item.set('showAddControl', false);
      item.set('showRemoveControl', showRemoveControl);
    });
    jns.set('lastObject.showAddControl', showAddControl);
  }.observes('hostNameCheckTrigger'),

  /**
   * Mark existing JournalNodes 'isInstalled' and 'showCurrentPrefix'
   */
  updateJournalNodeInfo: function() {
    var jns = this.get('selectedServicesMasters').filterProperty('component_name', 'JOURNALNODE');
    var hosts = App.HostComponent.find().filterProperty('componentName', 'JOURNALNODE').mapProperty('hostName');
    hosts.forEach(function(host) {
      var jn = jns.findProperty('selectedHost', host);
      if (jn) {
        jn.set('isInstalled', true);
        jn.set('showCurrentPrefix', true);
      }
    });
  }.observes('hostNameCheckTrigger'),

  /**
   * Callback after load controller data (hosts, host components etc)
   * @method loadStepCallback
   */
  loadStepCallback: function(components, self) {
    self.renderComponents(components);

    self.get('addableComponents').forEach(function (componentName) {
      self.updateComponent(componentName);
    }, self);
    self.set('isLoaded', true);
  },

  /**
   * Next button is disabled when there is any change to the original JournalNode hosts
   */
  nextButtonDisabled: function() {
    var currentHosts = this.get('selectedServicesMasters').filterProperty('component_name', 'JOURNALNODE').mapProperty('selectedHost');
    var originalHosts = App.HostComponent.find().filterProperty('componentName', 'JOURNALNODE').mapProperty('hostName');
    return currentHosts.sort().join() == originalHosts.sort().join();
  }.property('hostNameCheckTrigger')

});

