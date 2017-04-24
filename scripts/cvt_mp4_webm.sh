mp4_dir=""
webm_dir=""


webm_temp_dir="$webm_dir/temp"

cd $mp4_dir;
mkdir $webm_dir;

mkdir $webm_temp_dir;

files=`ls $mp4_dir`

for f in $files; do
	filename=${f%.*}
	extension=${f##*.}
	if [ $extension = "mp4" ]; then
		if [ ! -f "$filename.webm" ]; then
			ffmpeg -i $f -c:v libvpx -an -b 512K $webm_temp_dir/$filename.webm
			mv $webm_temp_dir/$filename.webm $webm_dir/$filename.webm
		else
			echo "$filename.webm already exists."
		fi;
	fi;
done

rm -rf $webm_temp_dir;
