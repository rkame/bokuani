<!DOCTYPE html>
<html lang="ja">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
	<title>phptest</title>
	<meta name="description" content="アニソンクラブイベント日曜日の昼開催">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
</head>

<body>

<!--#include virtual="test01.html" -->

<?php echo file_get_contents("test01.html"); ?>

<!--#echo var="DATE_LOCAL" -->
<br>
<?php
echo "test";

include '../event/bokuani01/index.html';

?>
</body>
</html>
