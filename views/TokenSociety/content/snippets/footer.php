<?php $text = Q_Text::get('TokenSociety/content'); ?>
<footer>
	<div class="layout-container ft-section">
		<div class="footer-block-1">
			<p><?= $text['footer']['JoinTokenSociety'];  ?> </p>
			<div class="subscribe-form">
				<input type="text">
				<button class="Q_button"><?= $text['footer']['Join'];  ?></button>
			</div>
			<p class="gr-t"><?= $text['footer']['Language'];  ?> </p>
			<div class="select-col">
				<select>
					<option><?= $text['footer']['English'];  ?></option>
					<option><?= $text['footer']['French'];  ?></option>
				</select>
			</div>
		</div>
		<div class="footer-block-2">
			<ul class="footer-menu">
				<li><a href="#"><?= $text['footer']['TokenSociety'];  ?> </a>
					<ul>
						<li><a href="#"><?= $text['footer']['Explore'];  ?> </a></li>
						<li><a href="#"><?= $text['footer']['Marketplace'];  ?> </a></li>
						<li><a href="#"><?= $text['footer']['HowItWorks'];  ?> </a></li>
						<li><a href="#"><?= $text['footer']['ConnectWallet'];  ?> </a></li>
					</ul>
				</li>
				<li><a href="#"><?= $text['footer']['Community'];  ?></a>
					<ul>
						<li><a href="#"><?= $text['footer']['BecomeACreator'];  ?> </a></li>
						<li><a href="#"><?= $text['footer']['CreateAShowcase'];  ?> </a></li>
						<li><a href="#"><?= $text['footer']['About Us'];  ?> </a></li>
						<li><a href="#"><?= $text['footer']['FAQSupport'];  ?> </a></li>
					</ul>
				</li>
			</ul>
		</div>
	</div>
	<div class="footer-2">
		<div class="container-ft">
			<div class="col-left">
				<ul class="footer-list">
					<li> <?= $text['footer']['Copyright'] .' '.date("Y").' '.$text['footer']['TokenSocietyLLC'] ?> </li>
					<li><a href="#"><?= $text['footer']['Terms'];  ?></a></li>
					<li><a href="#"><?= $text['footer']['Privacy'];  ?></a></li>
				</ul>
			</div>

			<div class="col-right">
				<ul class="footer-list list-2">

					<li><a href="#" class="ic-1"></a></li>
					<li><a href="#" class="ic-2"></a></li>
					<li><a href="#" class="ic-3"></a></li>
					<li><a href="#" class="ic-4"></a></li>
					<li><a href="#" class="ic-5"></a></li>
					<li><a href="#" class="ic-6"></a></li>
				</ul>
			</div>
		</div>

	</div>
</footer>