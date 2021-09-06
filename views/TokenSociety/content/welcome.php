<div id='content' style="text-align: center;">
	<div class="TC_mockups">
		<?php echo Q_Html::img('https://app.tokensociety.io/img/mockup2.png', array('class' => 'TS_mockup')) ?>
	</div>
	<?php if ($isMobile): ?>
		<img class="TokenSociety_banner TokenSociety_register" src="img/banner-mobile.png" class="TokenSociety_register">
	<?php else: ?>
		<img class="TokenSociety_banner TokenSociety_register" src="img/banner.jpg" class="TokenSociety_register">
	<?php endif; ?>
	<div id="firstpart" class="TokenSociety_register_view">
		<div class="pane pane1">
			<img src="img/snippetz.jpg" style="height: 400px">
			<div>
				<img src="img/soldout.jpg" style="height: 100px; margin-top: -20px;">
			</div>
		</div>
		<div class="pane pane2">
			<div class="muse-video-player" data-video="5ZCKcCB" data-search="0" data-logo="0" data-title="0" data-width="700"></div><script src="https://muse.ai/static/js/embed-player.min.js"></script>
		</div>
		<div class="pane pane3">
			<h1><?php echo Q::interpolate($welcome['TokenSociety'])?></h1>
			<h2><?php echo Q::interpolate($welcome['Tagline'])?></h2>
			<p>
				<?php echo Q::interpolate($welcome['NFTs']) ?>
				<?php echo Q::interpolate($welcome['Provenance']) ?>
				<?php echo Q::interpolate($welcome['Commissions'], array(ceil(Q::milliseconds()))) ?>
			</p>
	
			<div>
				<p>
					<button class="Q_button TokenSociety_register" style="">
						<?php echo $welcome['Register'] ?>
					</button>
				</p>
				<!--
				<h2><?php echo Q::interpolate($welcome['WeAreLive']) ?></h2>
				<p><?php echo Q::interpolate($welcome['OnboardingAbout']) ?></p>
				-->
			</div>
	
			<button class="Q_button Catalogs_connect_wallet" style="display: none; padding: 30px;">
				<?php echo $assets['ConnectWallet'] ?>
			</button>
		</div>
		<div class="comingsoon">
			<h2 style="text-align: center;">
				Exclusive TokenSociety NFT Drops Coming Soon
			</h2>
			<p>Showing digital works by</p>
			<div class="TokenSociety_coming">
				<?php foreach ($comingsoon as $k => $v): ?>
					<div class="TokenSociety_coming_item">
						<?= Q_Html::img("img/coming/$k")?>
						<div><?= $v ?></div>
					</div>
				<?php endforeach; ?>
			</div>
		</div>
		<div class="TokenSociety_socials">
			<h2>Follow us</h2>
			<?php foreach ($socials as $name => $link): ?>
				<?= Q_Html::a($link, ['target' => '_blank'], Q_Html::img("{{Communities}}/img/icon_$name.png", [
					'class' => 'TokenSociety_social_icon'
				]) . Q_Html::tag('div', ['class' => 'TokenSociety_social_name'], '')) ?>
			<?php endforeach; ?>
		</div>
	</div>
	<form id="secondpart" style="display: none;">
		<div id="TokenSociety_create_dialog">
			<form class="Catalogs_createNFT" action="TokenSociety/register" method="post">
				<!-- https://docs.opensea.io/docs/metadata-standards -->
				<table class="TokenSociety_register_details">
					<tr>
						<td>Name:</td>
						<td><input type="text" name="name" placeholder=""></td>
					</tr>
					<tr>
						<td>Professionally Known By:</td>
						<td>
							<input type="text" name="description" placeholder="">
						</td>
					</tr>
					<tr>
						<td>Country of Origin:</td>
						<td>
							<input type="text" name="image_url" placeholder="">
						</td>
					</tr>
					<tr>
						<td>Email:</td>
						<td>
							<input type="text" name="price" placeholder="">
						</td>
					</tr>
					<tr>
						<td>Website</td>
						<td>
							<input type="text" name="startTime" placeholder="https://mywebsite.com">
						</td>
					</tr>
					<tr>
						<td colspan="2" class="Catalogs_widecolumn">
							Social Media
						</td>
					</tr>
					<tr>
						<td>Telegram</td>
						<td>
							<input type="text" name="endTime" placeholder="optional">
						</td>
					</tr>
					<tr>
						<td>Twitter</td>
						<td>
							<input type="text" name="social_twitter" placeholder="optional">
						</td>
					</tr>
					<tr>
						<td>Instagram</td>
						<td>
							<input type="text" name="social_instagram" placeholder="optional">
						</td>
					</tr>
					<tr>
						<td>Other</td>
						<td>
							<input type="text" name="social_other" placeholder="optional">
						</td>
					</tr>
					<tr>
						<td></td>
						<td><button style="" 
							class="Q_button TokenSociety_register_submit" id="TokenSociety_submit">SUBMIT</button></td>
					</tr>
				</table>
			</form>
		</div>
	</form>
	<div id="thirdpart" style="display: none">
		<h2>Thank you for your request. An email will be sent to you regarding your membership status shortly.</h2>
	</div>
</div>
