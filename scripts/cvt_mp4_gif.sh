mp4_dir=""
gif_dir=""


gif_temp_dir="$gif_dir/temp"

cd $mp4_dir;
mkdir $gif_dir;

mkdir $gif_temp_dir;

files=`ls $mp4_dir`

for f in $files; do
	filename=${f%.*}
	extension=${f##*.}
	if [ $extension = "mp4" ]; then
		if [ ! -f "$gif_dir/$filename.gif" ]; then
			ffmpeg -i $f -vf scale=360:-1 $gif_temp_dir/$filename.gif
			mv $gif_temp_dir/$filename.gif $gif_dir/$filename.gif
		else
			echo "$filename.gif already exists."
		fi;
	fi;
done

rm -rf $gif_temp_dir;
