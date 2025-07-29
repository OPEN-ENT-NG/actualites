import {Collection, model as typedModel, Model, notify} from 'entcore';
import http from 'axios';
import { ACTUALITES_CONFIGURATION } from '../configuration';

import { Info } from './index';

const model = typedModel as any;

export class Thread extends Model {
    _id: number;
    infos: Collection<Info>;
    myRights: any;
    display_title: string;
    title: string;
    mode: any;
    icon: string;
    structure_id?: string;
    data: any;

    constructor (data?) {
        super();
        if (data) {
            for (let key in data) {
                this[key] = data[key];
            }
        }
        (this as any).collection(Info, {
            thisWeekInfos : [],
            beforeThisWeekInfos : [],
            drafts : [],
            pendings : [],
            headlines : []
        });
    }

    setDisplayName () {
        return this.display_title = this.title.length > 40
            ? (this.title.substring(0, 40) + '...')
            : this.title
    }

    load (data) {
        var resourceUrl = '/actualites/thread/' + this._id;
        if (data !== undefined) {
            resourceUrl = '/actualites/thread/' + data._id;
        }

        http.get(resourceUrl).then(function (response) {
            let content = response.data;
            this.updateData({
                title: content.title,
                icon: content.icon,
                order: content.order,
                mode: content.mode,
                loaded: true,
                modified: content.modified || this.modified,
                owner: content.owner || this.owner,
                ownerName: content.ownerName || this.ownerName,
                _id: content._id || this._id
            });

            this.trigger('change');
        }.bind(this));
    }

    async createThread () {
        this.mode = this.mode || ACTUALITES_CONFIGURATION.threadMode.SUBMIT;
        let response = await http.post('/actualites/thread', this);
        return response;
    }

    toJSON () {
        let json = {
            mode: this.mode,
            title: this.title,
            icon: undefined,
            structure_id: undefined,
        };
        if (this.icon){
            json.icon = this.icon;
        }
        if (this.structure_id){
            json.structure_id = this.structure_id;
        }
        return json;
    }

    async saveModifications () {
        this.mode = this.mode || ACTUALITES_CONFIGURATION.threadMode.SUBMIT;
        let response = await http.put('/actualites/thread/' + this._id, this);
        await model.infos.sync();
        this.setDisplayName();
        return response;
    }

    async save () {
        if (this._id) {
            if (this.title && this.title.length > 0) {
                return await this.saveModifications();
            } else {
                this.title = this.data.title;
            }
        }
        else {
            return await this.createThread();
        }
    }

    async remove (callback?) {
        try {
            await http.delete('/actualites/thread/' + this._id);
            if (typeof callback === 'function') {
                callback();
            } else {
                await model.infos.sync();
            }
        } catch (e) {
            notify.error('actualites.thread.delete.error');
        }
    }

    canPublish () {
        return this.myRights.publish !== undefined;
    }
}