import { Collection, $, idiom as lang, _, Model, moment, notify, model as typedModel, Behaviours } from 'entcore';
import http from 'axios';
import { Thread, Utils, Comment } from './index';
import { ACTUALITES_CONFIGURATION } from '../configuration';

const model = typedModel as any;

export class Info extends Model {
    _id: number;
    that: Info;
    status: number;
    comments: Collection<Comment>;
    newComment: Comment;
    preview: string;
    publication_date: any;
    hasPublicationDate: boolean;
    events: Collection<Event>;
    expiration_date: any;
    hasExpirationDate: boolean;
    title: string;
    content: string;
    thread: Thread;
    is_headline: boolean;
    owner: string;
    username: string;
    thread_id: number;
    myRights: any;
    tmpComments: any;
    edit: boolean;
    expanded: boolean;
    displayComments: boolean;
    number_of_comments: number;
    shared: any;
    hasReadMore : boolean;

    constructor (data?) {
        super();
        var that = this;
        const readMoreText = '... <strong class="read-more-link"><a>' + lang.translate('actualites.info.read.more') + '</a></strong>';
        this.newComment = new Comment();
        if (data){
            for (let key in data) {
                this[key] = data[key];
            }
            this.preview = $('<div>' + data.content + '</div>').text().substring(0, 500);
            if ( this.preview.length == 500) {
                this.preview = this.preview + readMoreText;
                this.hasReadMore = true;
            }
            this.preview = '<p>' + this.preview + '</p>';
        } else {
            this.status = ACTUALITES_CONFIGURATION.infoStatus.DRAFT;
        }
        delete this.comments;
        (this as any).collection(Comment);


        if (data && data.comments){
            this.comments.load(data.comments);
        }
        if (!data){
            this.publication_date = new Date();
        }
        (this as any).collection(Event, {
            sync : async (): Promise<any> => {
                that.events.all = [];
                return new Promise((resolve, reject) => {
                    http.get('/actualites/info/' + that._id + '/timeline').then(function (response) {
                        var newEvents = response.data.filter( event => !that.events.findWhere({_id : event._id}));
                        that.events.load(newEvents);
                        resolve();
                    }.bind(this));
                });
            }
        });
    }

    toJson () {
        let pubDate = null;
        let exportThis: any = {
            title: this.title,
            content: this.content,
            status: this.status,
            is_headline: this.is_headline,
            thread_id: this.thread._id
        };
        if (this.hasPublicationDate) {
            pubDate = this.publication_date;
            if(this.publication_date !== "Invalid date"){
                pubDate = (Utils.isDateFormateCompatible(pubDate))
                    ? Utils.getExploitableDate(pubDate)
                    : moment(pubDate);
                if (!pubDate.isSame(moment(), 'd')) pubDate.hour(1);
                exportThis.publication_date = pubDate.format('YYYY-MM-DD[T]HH:mm:ss.SSS');
            }
        }

        if (this.hasExpirationDate && this.expiration_date) {
            let expDate = this.expiration_date;
            if(Utils.isDateFormateCompatible(expDate)) expDate = Utils.getExploitableDate(expDate);
            exportThis.expiration_date = moment(expDate).format('YYYY-MM-DD[T]HH:mm:ss.SSS');
        }
        return exportThis;
    }

    async create () {
        if (!this.title){
            notify.info('title.missing');
            return false;
        }
        this.status = ACTUALITES_CONFIGURATION.infoStatus.DRAFT;
        await http.post('/actualites/thread/' + this.thread._id + '/info', this.toJson());
        model.infos.sync();

    }

    createPending (): boolean {
        if (!this.title){
            notify.info('title.missing');
            return false;
        }
        this.status = ACTUALITES_CONFIGURATION.infoStatus.PENDING;
        http.post('/actualites/thread/' + this.thread._id + '/info/pending', this.toJson()).then(function () {
            model.infos.sync();
        }.bind(this));
        return true;
    }

    createPublished (callback): boolean {
        if (!this.title){
            notify.info('title.missing');
            return false;
        }
        this.status = ACTUALITES_CONFIGURATION.infoStatus.PUBLISHED;
        http.post('/actualites/thread/' + this.thread._id + '/info/published', this.toJson()).then(function (response) {
            if (callback && (typeof (callback) === 'function')) {
                callback(response.data);
            }
            model.infos.sync();
        }.bind(this));
        return true;
    }

    async saveModifications () {
        const resourceUrl = '/' + ACTUALITES_CONFIGURATION.applicationName + '/thread/' + this.thread._id + '/info/' + this._id + '/' + ACTUALITES_CONFIGURATION.statusNameFromId(this.status);
        await http.put(resourceUrl, this.toJson());
    }

    async save () {
        if (this._id){
            await this.saveModifications();
        } else {
            return this.create();
        }
    }

    submit () {
        this.status = ACTUALITES_CONFIGURATION.infoStatus.PENDING;
        http.put('/actualites/thread/' + this.thread._id + '/info/' + this._id + '/submit', { title: this.title })
            .then(function () {
                model.infos.sync();
            });
    }

    async unsubmit () {
        this.status = ACTUALITES_CONFIGURATION.infoStatus.DRAFT;
        await http.put('/actualites/thread/' + this.thread._id + '/info/' + this._id + '/unsubmit', { title: this.title });
    }

    async publish () {
        this.status = ACTUALITES_CONFIGURATION.infoStatus.PUBLISHED;
        await http.put('/actualites/thread/' + this.thread._id + '/info/' + this._id + '/publish', { title: this.title, owner: this.owner, username: this.username });
    }

    unpublish (canSkipPendingStatus) {
        if (!canSkipPendingStatus) {
            this.status = ACTUALITES_CONFIGURATION.infoStatus.PENDING;
            http.put('/actualites/thread/' + this.thread._id + '/info/' + this._id + '/unpublish', { title: this.title, owner: this.owner, username: this.username })
                .then(function () {
                    model.infos.sync();
                });
        } else {
            this.unsubmit();
        }
    }

    // @Deprecated
    // trash () {
    //     var resourceUrl = '/' + ACTUALITES_CONFIGURATION.applicationName + '/thread/' + this.thread._id + '/info/' + this._id + '/trash';
    //     var info = this;
    //     http.put(resourceUrl).then(function () {
    //         info.load(thread);
    //     });
    // }

    // @Deprecated
    // restore () {
    //     var resourceUrl = '/' + ACTUALITES_CONFIGURATION.applicationName + '/thread/' + this.thread._id + '/info/' + this._id + '/restore';
    //     var info = this;
    //     http.put(resourceUrl).then(function () {
    //         info.load(thread);
    //     });
    // }

    async delete () {
        await http.delete('/actualites/thread/' + this.thread_id + '/info/' + this._id);
    }

    async comment (commentText) {
        var info = this;
        await http.put('/actualites/info/' + this._id + '/comment', { info_id: this._id, title: this.title, comment: commentText })
            .then(function (response) {
                let comment = response.data;
                info.comments.push(new Comment({
                    _id: comment.id,
                    owner: model.me.userId,
                    username: model.me.username,
                    comment: commentText,
                    created: moment(),
                    modified: moment()
                }));
                info.number_of_comments++;
            });
    }

    async deleteComment (comment, index) {
        var info = this;
        await http.delete('/actualites/info/' + this._id + '/comment/' + comment._id).then(function () {
            info.comments.splice(index, 1);
            info.number_of_comments--;
        });
    }

    async loadCommentsAndShared (displayComments: boolean) {
        var info = this;
        let p1, p2;
        if (info.number_of_comments > 0 && info.comments && info.comments.all.length == 0) {
            p1 = http.get('/actualites/infos/' + this._id + '/comments').then(obj => {
                info.comments.load(obj.data);
            });
        } else { p1 = Promise.resolve(); }
        if (!info.shared) {
            p2 = http.get('/actualites/infos/' + this._id + '/shared').then(obj => {
                info.shared = obj.data;
                Behaviours.findRights('actualites', info);
            });
        } else { p2 = Promise.resolve(); }

        await Promise.all([p1, p2]);
        info.displayComments = displayComments;
        info.expanded = !info.expanded;
    }

    allow (action) {
        if (action === 'view'){
            //Hide when I don't have publish rights and I'm not author if : the info was submitted or the info is outside its lifespan
            return (
                    this.status === ACTUALITES_CONFIGURATION.infoStatus.PUBLISHED &&
                    !(this.hasPublicationDate && moment().isBefore(Utils.getDateAsMoment(this.publication_date))) &&
                    !(this.hasExpirationDate && moment().isAfter(Utils.getDateAsMoment(this.expiration_date).add(1, 'days')))
                )
                || this.owner === model.me.userId
                || this.thread.myRights.publish;

        }
        if (action === 'comment') {
            return this.myRights.comment && (this.status === ACTUALITES_CONFIGURATION.infoStatus.PUBLISHED || this.status === ACTUALITES_CONFIGURATION.infoStatus.PENDING);
        }
        if (action === 'edit' || action === 'share'){
            return this.thread.myRights.publish || (model.me.userId === this.owner && (this.status === ACTUALITES_CONFIGURATION.infoStatus.DRAFT || this.status));
        }
        if (action === 'viewShare') {
            return false;
        }
        if (action === 'unpublish') {
            return this.status === ACTUALITES_CONFIGURATION.infoStatus.PUBLISHED && this.thread.myRights.publish && !(model.me.userId === this.owner);
        }
        if (action === 'unsubmit') {
            return (this.status === ACTUALITES_CONFIGURATION.infoStatus.PENDING && (this.thread.myRights.publish || model.me.userId === this.owner)) ||
                (this.status === ACTUALITES_CONFIGURATION.infoStatus.PUBLISHED && this.thread.myRights.publish && model.me.userId === this.owner);
        }
        if (action === 'publish') {
            return (this.status === ACTUALITES_CONFIGURATION.infoStatus.DRAFT || this.status === ACTUALITES_CONFIGURATION.infoStatus.PENDING) && this.thread.myRights.publish;
        }
        if (action === 'submit') {
            return (this.status === ACTUALITES_CONFIGURATION.infoStatus.DRAFT) && !this.thread.myRights.publish;
        }
        if (action === 'remove') {
            return ((this.status === ACTUALITES_CONFIGURATION.infoStatus.DRAFT || this.status === ACTUALITES_CONFIGURATION.infoStatus.PENDING) && model.me.userId === this.owner) ||
                this.thread.myRights.manager || (this.thread.myRights.publish && model.me.userId === this.owner);
        }
    }
}