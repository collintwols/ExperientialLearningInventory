import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import TermInput from './TermInput.jsx';
import TermTable from './TermTable.jsx';
import ErrorMessagesBlock from './ErrorMessagesBlock.jsx';

/**
 * This file is part of Internship Inventory.
 *
 * Internship Inventory is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * Internship Inventory is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License version 3
 * along with Internship Inventory.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Copyright 2011-2018 Appalachian State University
 * Copyright 2020 Brown Book Software, LLC
 */

class TermEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mainData: null,
      errorWarning: null,
      messageType: null,
      inputData: null
    };

    this.dateToTimestamp = this.dateToTimestamp.bind(this);
    this.getData = this.getData.bind(this);
    this.onTermCreate = this.onTermCreate.bind(this);
    this.onTermSave = this.onTermSave.bind(this);
  }

  componentDidMount() {
    this.getData();
  }

  getData() {
    fetch('index.php?module=intern&action=termRest')
      .then(response => response.json())
      .then(result => {
        this.setState({ mainData: result });
      })
      .catch(error => {
        console.log('Error:', error);
      });
  }

  onTermCreate(tcode, stype, descr, census, available, start, end, ugradOver, gradOver) {
    let errorMessage = null;

    if (tcode === '') {
      errorMessage = 'Please enter a term code.';
      this.setState({ errorWarning: errorMessage, messageType: 'error' });
      return;
    }
    if (stype === '') {
      errorMessage = 'Please enter a semester type.';
      this.setState({ errorWarning: errorMessage, messageType: 'error' });
      return;
    }
    if (descr === '') {
      errorMessage = 'Please enter a term description.';
      this.setState({ errorWarning: errorMessage, messageType: 'error' });
      return;
    }
    if (census === '') {
      errorMessage = 'Please enter a census date.';
      this.setState({ errorWarning: errorMessage, messageType: 'error' });
      return;
    }
    if (available === '') {
      errorMessage = 'Please enter the date the term is available.';
      this.setState({ errorWarning: errorMessage, messageType: 'error' });
      return;
    }
    if (start === '') {
      errorMessage = 'Please enter a start date.';
      this.setState({ errorWarning: errorMessage, messageType: 'error' });
      return;
    }
    if (end === '') {
      errorMessage = 'Please enter an end date.';
      this.setState({ errorWarning: errorMessage, messageType: 'error' });
      return;
    }
    if (ugradOver === '') {
      errorMessage = 'Please enter undergraduate overload hours.';
      this.setState({ errorWarning: errorMessage, messageType: 'error' });
      return;
    }
    if (gradOver === '') {
      errorMessage = 'Please enter graduate overload hours.';
      this.setState({ errorWarning: errorMessage, messageType: 'error' });
      return;
    }

    census = this.dateToTimestamp(census);
    available = this.dateToTimestamp(available);
    start = this.dateToTimestamp(start);
    end = this.dateToTimestamp(end);

    const postData = {
      code: tcode,
      type: stype,
      descr,
      census,
      available,
      start,
      end,
      ugradOver,
      gradOver
    };

    fetch('index.php?module=intern&action=termRest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    })
      .then(response => response.json())
      .then(result => {
        this.setState({ errorWarning: 'Term successfully added', messageType: 'success' });
        this.getData(); // Refresh the data and update the table after term is updated
      })
      .catch(error => {
        console.error(error);
        this.setState({ errorWarning: 'Failed to add term', messageType: 'error' });
      });
  }

  onTermSave(newtermc, newsemtype, newdescri, newcensusd, newavaild, newstartd, newendd, newugradover, newgradover, oldTcode) {
    newcensusd = this.dateToTimestamp(newcensusd);
    newavaild = this.dateToTimestamp(newavaild);
    newstartd = this.dateToTimestamp(newstartd);
    newendd = this.dateToTimestamp(newendd);

    const cleanoldTcode = encodeURIComponent(oldTcode);
    const cleantermc = encodeURIComponent(newtermc);
    const cleansemtype = encodeURIComponent(newsemtype);
    const cleandescri = encodeURIComponent(newdescri);
    const cleancensusd = encodeURIComponent(newcensusd);
    const cleanavaild = encodeURIComponent(newavaild);
    const cleanstartd = encodeURIComponent(newstartd);
    const cleanendd = encodeURIComponent(newendd);
    const cleanugradover = encodeURIComponent(newugradover);
    const cleangradover = encodeURIComponent(newgradover);

    const url =
      'index.php?module=intern&action=termRest&newTcode=' +
      cleantermc +
      '&newSemtype=' +
      cleansemtype +
      '&newDesc=' +
      cleandescri +
      '&newCensus=' +
      cleancensusd +
      '&newAvail=' +
      cleanavaild +
      '&newStart=' +
      cleanstartd +
      '&newEnd=' +
      cleanendd +
      '&newUgradOver=' +
      cleanugradover +
      '&newGradOver=' +
      cleangradover +
      '&oldTcode=' +
      cleanoldTcode;

    // TODO: Use fetch API
    $.ajax({
      url,
      type: 'PUT',
      success: function (data) {
        $('#success').show();
        this.setState({ success: 'Changes saved.' });
        this.getData(); // Refresh the data and update the table after term is updated
      }.bind(this),
      error: function (xhr, status, err) {
        const errorMessage = 'Failed to update term.';
        console.error(url, status, err.toString());
        this.setState({ errorWarning: errorMessage, messageType: 'error' });
      }.bind(this)
    });
  }

  dateToTimestamp(dateString) {
    return new Date(dateString).getTime() / 1000;
  }

  render() {
    let errors;
    if (this.state.errorWarning == null) {
      errors = '';
    } else {
      errors = (
        <CSSTransition timeout={500} classNames="example">
          <ErrorMessagesBlock key="errorSet" errors={this.state.errorWarning} messageType={this.state.messageType} />
        </CSSTransition>
      );
    }

    return (
      <div className="terms">
        <TransitionGroup>{errors}</TransitionGroup>

        <div className="row">
          <div className="col-sm-6">
            <div className="panel panel-default">
              <div className="panel-body">
                <p className="lead">Create a new Term: </p>
                <TermInput onTermCreate={this.onTermCreate} messageType={this.state.messageType} />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12">
            <TermTable termData={this.state.mainData} onTermSave={this.onTermSave} />
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<TermEditor />, document.getElementById('edit_terms'));

if (process.env.NODE_ENV !== 'production') {
  const axe = require('@axe-core/react');
  axe(React, ReactDOM, 1000);
}
