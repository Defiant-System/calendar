<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="calendar-list">
	<ul>
		<xsl:for-each select="./*">
			<li>
				<xsl:attribute name="data-id"><xsl:value-of select="@id"/></xsl:attribute>
				<span>
					<xsl:attribute name="class">form-checkbox_ <xsl:value-of select="@color"/></xsl:attribute>
					<input type="checkbox" checked="checked">
						<xsl:attribute name="id">calendar-<xsl:value-of select="@id"/></xsl:attribute>
					</input>
					<i></i>
				</span>
				<label>
					<xsl:attribute name="for">calendar-<xsl:value-of select="@id"/></xsl:attribute>
					<xsl:value-of select="@name"/>
				</label>
				<span class="cal-edit" data-click="edit-calendar-entry">Edit</span>
			</li>
		</xsl:for-each>
		<li class="add-calendar">
			<i class="icon-plus"></i>
			<span>Add Calendar</span>
		</li>
	</ul>
</xsl:template>


<xsl:template name="popup-calendar-details">
	<div class="popup-event" data-area="popup">
		<xsl:attribute name="data-calId"><xsl:value-of select="@id"/></xsl:attribute>
		<div class="row-head">
			<h3 contenteditable="true" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
				<xsl:value-of select="@name"/>
			</h3>
		</div>
		<hr/>
		<div class="row-colors">
			<span>Color:</span>
			<div>
				<i class="calendar-color blue active"></i>
				<i class="calendar-color lightblue"></i>
				<i class="calendar-color red"></i>
				<i class="calendar-color purple"></i>
				<i class="calendar-color orange"></i>
				<i class="calendar-color yellow"></i>
				<i class="calendar-color green"></i>
				<i class="calendar-color cyan"></i>
				<i class="calendar-color gray"></i>
			</div>
		</div>
		<hr/>
		<div class="row-actions">
			<div class="pop-button">
				<i class="icon-email"></i>
			</div>
			<div class="pop-button">
				<i class="icon-trashcan"></i>
			</div>
		</div>
	</div>
</xsl:template>


<xsl:template name="popup-event">
	<div class="popup-event" data-area="popup">
		<xsl:attribute name="data-id"><xsl:value-of select="@id"/></xsl:attribute>

		<xsl:choose>
			<xsl:when test="@type = 'day'">
				<div class="row-head">
					<i>
						<xsl:attribute name="class">calendar-color <xsl:value-of select="../@color"/></xsl:attribute>
					</i>
					<h3>
						<xsl:value-of select="@title"/>
					</h3>
				</div>
				<div class="row-date">
					<i class="icon-calendar"></i>
					<div>
						<span class="event-date"><xsl:value-of select="@i18n-date"/></span>
					</div>
				</div>
				<hr/>
				<div class="row-info">
					<i class="icon-info"></i>
					<div><xsl:value-of select="../@title"/></div>
				</div>
			</xsl:when>
			<xsl:otherwise>
				<div class="row-head">
					<i>
						<xsl:attribute name="class">calendar-color <xsl:value-of select="//Events/Calendars/*[@id = current()/@calendar-id]/@color"/></xsl:attribute>
					</i>
					<h3 contenteditable="true" placeholder="New Event" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
						<xsl:if test="not(@isNew)"><xsl:value-of select="@title"/></xsl:if>
					</h3>
				</div>
				<div class="row-location">
					<i class="icon-location-pin"></i>
					<input type="text" placeholder="Add Location"/>
				</div>
				<hr/>
				<div class="row-date">
					<i class="icon-calendar"></i>
					<div>
						<span class="event-date"><xsl:value-of select="@i18n-date"/></span>
						<span class="event-starts" data-change="popup-time-change"><xsl:value-of select="@i18n-starts"/></span>
						<span>to</span>
						<span class="event-ends" data-change="popup-time-change"><xsl:value-of select="@i18n-ends"/></span>
					</div>
				</div>
				<hr/>
				<div class="row-users">
					<i class="icon-user"></i>
					<input type="text" placeholder="Add Invitees"/>
				</div>
				<hr/>
				<div class="row-attachments">
					<i class="icon-paperclip"></i>
					<input type="text" placeholder="Add Notes, URL or Attachments"/>
				</div>
			</xsl:otherwise>
		</xsl:choose>
	</div>
</xsl:template>

</xsl:stylesheet>

