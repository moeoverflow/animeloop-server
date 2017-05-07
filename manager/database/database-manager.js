var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// var async = require('async');

var Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;


var seriesSchema = new Schema({
    title_zh: { type: String, unique: true, require: true },
    title_jp: String,
    title_en: String,
});

var episodeSchema = new Schema({
    title_zh: { type: String, unique: true, require: true },
    title_jp: String,
    title_en: String,
    series: { type: ObjectId, ref: 'Series' },
});

var loopSchema = new Schema({
    duration: Number,
    period_begin: Number,
    period_end: Number,
    frame_begin: Number,
    frame_end: Number,
    episode: { type: ObjectId, ref: 'Episode' },
    series: { type: ObjectId, ref: 'Series' },
    r18: {
        type: Boolean,
        default: false
    },
    tags: [String],
    files: {
        mp4_1080p: String,
        gif_360p: String,
        cover_1080p: String
    }
});


class DatabaseManager {
    constructor(url) {
        this.mongoose.connect(url);
    }
    static Series  = mongoose.model('Series', seriesSchema);
    static Episode  = mongoose.model('Episode', episodeSchema);
    static Loop = mongoose.model('Loop', loopSchema);

    add
}



var series = new Series({
    title_zh: "series_title3"
});
var episode = new Episode({
    title_zh: "episode_title3",
    series: series._id
});
var loop = new Loop({
    duration: 1.2,
    period_begin: 1.0,
    period_end: 2.0,
    frame_begin: 100,
    frame_end: 200,
    series: series._id,
    episode: episode._id,
    r18: true,
    tags: ["tag1", "tag2"],
    files: {
        mp4_1080p: "/home/shincurry/1080p.mp4",
        gif_360p: "/home/shincurry/360p.gif",
        cover_1080p: "/home/shincurry/1080p.jpg"
    }
});


Series.findOne({ title_zh: "series_title3"}, function (err, ser){
    console.log("step1")
    if (ser) {
        loop.series = ser._id;
    } else {
        series.save();
    }
    Episode.findOne({ title_zh: "episode_title3"}, function (err, epi){
        console.log("step2")
        if (epi) {
            loop.episode = epi._id;
        } else {
            episode.save();
        }
        loop.save();
    });
});



