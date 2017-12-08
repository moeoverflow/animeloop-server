/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;


const SeriesSchema = new Schema({
  title: String,
  title_t_chinese: String,
  title_romaji: String,
  title_english: String,
  title_japanese: String,
  start_date_fuzzy: Number,
  description: String,
  genres: [String],
  total_episodes: Number,
  adult: Boolean,
  end_date_fuzzy: Number,
  hashtag: String,
  image_url_large: String,
  image_url_banner: String,
  anilist_updated_at: Date,
  updated_at: Date,
  type: String,
  anilist_id: { type: Number, unique: true },
});
SeriesSchema.plugin(findOrCreate);

const EpisodeSchema = new Schema({
  title: String,
  series: { type: ObjectId, ref: 'Series', require: true },
  no: String,
});
EpisodeSchema.plugin(findOrCreate);

const LoopSchema = new Schema({
  duration: Number,
  period: {
    begin: String,
    end: String,
  },
  frame: {
    begin: Number,
    end: Number,
  },
  episode: { type: ObjectId, ref: 'Episode', require: true },
  series: { type: ObjectId, ref: 'Series', require: true },
  r18: { type: Boolean, default: false },
  sourceFrom: String,
  uploadDate: { type: Date, require: true },
  review: { type: Boolean, default: false },
});

const TagsSchema = new Schema({
  loopid: ObjectId,
  type: String,
  value: String,
  confidence: Number,
  source: String,
  lang: Number,
});

module.exports = {
  LoopSchema,
  EpisodeSchema,
  SeriesSchema,
  TagsSchema,
};
