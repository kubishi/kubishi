import React from 'react';
import api from '../Api';
import { formatLesson } from '../common/helpers';
import history from '../common/history';
import LessonForm from './LessonForm';

class LessonNew extends React.Component {
    constructor(props) {
        super(props);
    }

    addLesson(lesson) {
        if (lesson == null) return;

        let body = formatLesson(lesson);
        if (Object.keys(body).length <= 0) return; // no update

        api.post('/api/lessons', body).then(res => {
            if (res.status == 200 && res.data.success) {
                return history.push(`/lessons/${res.data.result._id}`);
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    render() {
        return <LessonForm onSave={lesson => this.addLesson(lesson)} />;
    }
};

export default LessonNew;